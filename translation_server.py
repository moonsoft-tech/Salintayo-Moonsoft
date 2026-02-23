"""
Translation Server using Flask
Serves the trained PyTorch translation model
"""
import os
import torch
import torch.nn as nn
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_DIR = "models/filipino_translator"
MODEL_PATH = os.path.join(MODEL_DIR, 'translation_model.pt')

# Load model and vocabularies
print("Loading translation model...")
checkpoint = torch.load(MODEL_PATH, map_location='cpu', weights_only=False)

src_word2idx = checkpoint['src_word2idx']
tgt_word2idx = checkpoint['tgt_word2idx']
src_idx2word = checkpoint['src_idx2word']
tgt_idx2word = checkpoint['tgt_idx2word']

# Model class
class Seq2Seq(nn.Module):
    def __init__(self, src_vocab_size, tgt_vocab_size, embed_dim, hidden_dim):
        super().__init__()
        self.hidden_dim = hidden_dim
        self.src_embed = nn.Embedding(src_vocab_size, embed_dim, padding_idx=0)
        self.tgt_embed = nn.Embedding(tgt_vocab_size, embed_dim, padding_idx=0)
        
        self.encoder = nn.GRU(embed_dim, hidden_dim, batch_first=True)
        self.decoder = nn.GRU(embed_dim + hidden_dim, hidden_dim, batch_first=True)
        
        self.attn = nn.Linear(hidden_dim * 2, embed_dim)
        self.v = nn.Linear(embed_dim, 1, bias=False)
        
        self.fc = nn.Linear(hidden_dim, tgt_vocab_size)
        
    def forward(self, src, tgt, teacher_forcing_ratio=0.0):
        import random
        batch_size = src.shape[0]
        tgt_len = tgt.shape[1]
        
        src_embedded = self.src_embed(src)
        encoder_outputs, hidden = self.encoder(src_embedded)
        
        outputs = []
        decoder_input = tgt[:, 0]
        
        for t in range(1, tgt_len):
            decoder_embedded = self.tgt_embed(decoder_input).unsqueeze(1)
            
            hidden_expanded = hidden.permute(1, 0, 2).expand(-1, encoder_outputs.size(1), -1)
            energy = torch.tanh(self.attn(torch.cat([hidden_expanded, encoder_outputs], dim=2)))
            attn_weights = torch.softmax(self.v(energy).squeeze(2), dim=1).unsqueeze(1)
            context = torch.bmm(attn_weights, encoder_outputs)
            
            decoder_input_combined = torch.cat([decoder_embedded, context], dim=2)
            decoder_output, hidden = self.decoder(decoder_input_combined, hidden)
            
            prediction = self.fc(decoder_output.squeeze(1))
            outputs.append(prediction)
            
            top1 = prediction.argmax(1)
            decoder_input = top1
        
        return torch.stack(outputs, dim=1)

# Initialize model
EMBEDDING_DIM = 64
HIDDEN_DIM = 64
model = Seq2Seq(len(src_word2idx), len(tgt_word2idx), EMBEDDING_DIM, HIDDEN_DIM)
model.load_state_dict(checkpoint['model'])
model.eval()

print("Model loaded successfully!")

def tokenize(text):
    return text.lower().split()

def translate(text, max_len=30):
    tokens = tokenize(text.lower())
    src_indices = torch.tensor([src_word2idx.get(w, src_word2idx['<UNK>']) for w in tokens]).unsqueeze(0)
    
    with torch.no_grad():
        src_embedded = model.src_embed(src_indices)
        encoder_outputs, hidden = model.encoder(src_embedded)
        
        outputs = []
        decoder_input = torch.tensor([tgt_word2idx['<SOS>']])
        
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
            decoder_input = torch.tensor([top1])
    
    return ' '.join([tgt_idx2word.get(i, '') for i in outputs])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'filipino_translator'})

@app.route('/translate', methods=['POST'])
def translate_endpoint():
    data = request.json
    
    text = data.get('text', '')
    src_lang = data.get('src_lang', 'en')
    tgt_lang = data.get('tgt_lang', 'fil')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        # Simple language detection and translation
        if src_lang == 'en' and tgt_lang == 'fil':
            translation = translate(text)
        elif src_lang == 'fil' and tgt_lang == 'en':
            translation = translate(text)  # Would need reverse model
        else:
            translation = translate(text)
        
        return jsonify({
            'translation': translation,
            'source_lang': src_lang,
            'target_lang': tgt_lang
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("Translation Server Starting...")
    print("Server running at http://localhost:5000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
