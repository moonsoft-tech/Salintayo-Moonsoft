"""
Simple Neural Machine Translation Model using PyTorch
English to Filipino Translation
"""
import os
import random
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

# Set seeds for reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

# Configuration
DATA_DIR = "data"
MODEL_DIR = "models/filipino_translator"
EMBEDDING_DIM = 64
HIDDEN_DIM = 64
BATCH_SIZE = 8
EPOCHS = 300
LEARNING_RATE = 0.001

os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("Simple Neural Translation Model - English to Filipino")
print("=" * 60)

# Load data
def load_data(src_file, tgt_file):
    src_data, tgt_data = [], []
    with open(src_file, 'r', encoding='utf-8') as f:
        for line in f:
            src_data.append(line.strip().lower())
    with open(tgt_file, 'r', encoding='utf-8') as f:
        for line in f:
            tgt_data.append(line.strip().lower())
    return src_data, tgt_data

print("\n[1] Loading data...")
src_lines, tgt_lines = load_data(
    os.path.join(DATA_DIR, "train-en.txt"),
    os.path.join(DATA_DIR, "train-fil.txt")
)
print(f"Loaded {len(src_lines)} sentence pairs")

# Tokenize
def tokenize(text):
    return text.lower().split()

# Build vocabulary
print("\n[2] Building vocabularies...")
src_word2idx = {'<PAD>': 0, '<SOS>': 1, '<EOS>': 2, '<UNK>': 3}
tgt_word2idx = {'<PAD>': 0, '<SOS>': 1, '<EOS>': 2, '<UNK>': 3}

for src in src_lines:
    for word in tokenize(src):
        if word not in src_word2idx:
            src_word2idx[word] = len(src_word2idx)

for tgt in tgt_lines:
    for word in tokenize(tgt):
        if word not in tgt_word2idx:
            tgt_word2idx[word] = len(tgt_word2idx)

src_idx2word = {v: k for k, v in src_word2idx.items()}
tgt_idx2word = {v: k for k, v in tgt_word2idx.items()}

print(f"Source vocabulary: {len(src_word2idx)}")
print(f"Target vocabulary: {len(tgt_word2idx)}")

# Dataset
class TranslationDataset(Dataset):
    def __init__(self, src_lines, tgt_lines, src_word2idx, tgt_word2idx):
        self.src_lines = src_lines
        self.tgt_lines = tgt_lines
        self.src_word2idx = src_word2idx
        self.tgt_word2idx = tgt_word2idx
        
    def __len__(self):
        return len(self.src_lines)
    
    def __getitem__(self, idx):
        src = self.src_lines[idx]
        tgt = self.tgt_lines[idx]
        
        src_indices = [self.src_word2idx.get(w, self.src_word2idx['<UNK>']) for w in tokenize(src)]
        tgt_indices = [self.tgt_word2idx['<SOS>']] + \
                      [self.tgt_word2idx.get(w, self.tgt_word2idx['<UNK>']) for w in tokenize(tgt)] + \
                      [self.tgt_word2idx['<EOS>']]
        
        return torch.tensor(src_indices), torch.tensor(tgt_indices)

def collate_fn(batch):
    src_batch, tgt_batch = [], []
    for src, tgt in batch:
        src_batch.append(src)
        tgt_batch.append(tgt)
    
    src_batch = nn.utils.rnn.pad_sequence(src_batch, batch_first=True, padding_value=0)
    tgt_batch = nn.utils.rnn.pad_sequence(tgt_batch, batch_first=True, padding_value=0)
    
    return src_batch, tgt_batch

# Simplified Seq2Seq Model
class Seq2Seq(nn.Module):
    def __init__(self, src_vocab_size, tgt_vocab_size, embed_dim, hidden_dim):
        super().__init__()
        self.hidden_dim = hidden_dim
        self.src_embed = nn.Embedding(src_vocab_size, embed_dim, padding_idx=0)
        self.tgt_embed = nn.Embedding(tgt_vocab_size, embed_dim, padding_idx=0)
        
        # Use single directional GRU
        self.encoder = nn.GRU(embed_dim, hidden_dim, batch_first=True)
        self.decoder = nn.GRU(embed_dim + hidden_dim, hidden_dim, batch_first=True)  # input = embed + context
        
        # Attention
        self.attn = nn.Linear(hidden_dim * 2, embed_dim)
        self.v = nn.Linear(embed_dim, 1, bias=False)
        
        self.fc = nn.Linear(hidden_dim, tgt_vocab_size)
        
    def forward(self, src, tgt, teacher_forcing_ratio=0.5):
        batch_size = src.shape[0]
        tgt_len = tgt.shape[1]
        
        # Encode
        src_embedded = self.src_embed(src)
        encoder_outputs, hidden = self.encoder(src_embedded)
        
        # Decode
        outputs = []
        decoder_input = tgt[:, 0]
        
        for t in range(1, tgt_len):
            decoder_embedded = self.tgt_embed(decoder_input).unsqueeze(1)
            
            # Simple attention
            hidden_expanded = hidden.permute(1, 0, 2).expand(-1, encoder_outputs.size(1), -1)
            energy = torch.tanh(self.attn(torch.cat([hidden_expanded, encoder_outputs], dim=2)))
            attn_weights = torch.softmax(self.v(energy).squeeze(2), dim=1).unsqueeze(1)
            context = torch.bmm(attn_weights, encoder_outputs)  # (batch, 1, hidden)
            
            # Decoder step - concatenate context with embedded
            decoder_input_combined = torch.cat([decoder_embedded, context], dim=2)
            decoder_output, hidden = self.decoder(decoder_input_combined, hidden)
            
            prediction = self.fc(decoder_output.squeeze(1))
            outputs.append(prediction)
            
            # Teacher forcing
            teacher_force = random.random() < teacher_forcing_ratio
            top1 = prediction.argmax(1)
            decoder_input = tgt[:, t] if teacher_force else top1
        
        return torch.stack(outputs, dim=1)

# Create datasets
print("\n[3] Preparing data...")
dataset = TranslationDataset(src_lines, tgt_lines, src_word2idx, tgt_word2idx)
dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn)

# Initialize model
print("\n[4] Initializing model...")
model = Seq2Seq(len(src_word2idx), len(tgt_word2idx), EMBEDDING_DIM, HIDDEN_DIM)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

model = model.to(device)

criterion = nn.CrossEntropyLoss(ignore_index=0)
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

# Training
print("\n[5] Training model...")
print("-" * 60)

for epoch in range(EPOCHS):
    model.train()
    total_loss = 0
    
    for batch in dataloader:
        src, tgt = batch
        src = src.to(device)
        tgt = tgt.to(device)
        
        optimizer.zero_grad()
        output = model(src, tgt)
        
        output = output.contiguous().view(-1, output.shape[-1])
        tgt = tgt[:, 1:].contiguous().view(-1)
        
        loss = criterion(output, tgt)
        loss.backward()
        
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        
        total_loss += loss.item()
    
    avg_loss = total_loss / len(dataloader)
    
    if (epoch + 1) % 30 == 0:
        print(f"Epoch {epoch+1}/{EPOCHS}, Loss: {avg_loss:.4f}")

# Save model
print("\n[6] Saving model...")
torch.save({
    'model': model.state_dict(),
    'src_word2idx': src_word2idx,
    'tgt_word2idx': tgt_word2idx,
    'src_idx2word': src_idx2word,
    'tgt_idx2word': tgt_idx2word,
}, os.path.join(MODEL_DIR, 'translation_model.pt'))

print(f"Model saved to {MODEL_DIR}/translation_model.pt")

# Translation function
def translate(text, max_len=30):
    model.eval()
    
    tokens = tokenize(text.lower())
    src_indices = torch.tensor([src_word2idx.get(w, src_word2idx['<UNK>']) for w in tokens]).unsqueeze(0).to(device)
    
    with torch.no_grad():
        src_embedded = model.src_embed(src_indices)
        encoder_outputs, hidden = model.encoder(src_embedded)
        
        outputs = []
        decoder_input = torch.tensor([tgt_word2idx['<SOS>']]).to(device)
        
        for _ in range(max_len):
            decoder_embedded = model.tgt_embed(decoder_input).unsqueeze(1)
            
            hidden_expanded = hidden.permute(1, 0, 2).expand(-1, encoder_outputs.size(1), -1)
            energy = torch.tanh(model.attn(torch.cat([hidden_expanded, encoder_outputs], dim=2)))
            attn_weights = torch.softmax(model.v(energy).squeeze(2), dim=1).unsqueeze(1)
            context = torch.bmm(attn_weights, encoder_outputs)
            
            decoder_input_combined = torch.cat([decoder_embedded, context], dim=2)
            decoder_output, hidden = model.decoder(decoder_input_combined, hidden)
            
            prediction = model.fc(decoder_output.squeeze(1))
            top1 = prediction.argmax(1).item()
            
            if top1 == tgt_word2idx['<EOS>']:
                break
                
            outputs.append(top1)
            decoder_input = torch.tensor([top1]).to(device)
    
    return ' '.join([tgt_idx2word.get(i, '') for i in outputs])

# Test translation
print("\n[7] Testing translation:")
print("-" * 60)
test_phrases = ["hello", "thank you", "good morning", "goodbye", "yes"]
for phrase in test_phrases:
    translation = translate(phrase)
    print(f"EN: {phrase} -> FIL: {translation}")

print("\n" + "=" * 60)
print("Training complete!")
print("=" * 60)
