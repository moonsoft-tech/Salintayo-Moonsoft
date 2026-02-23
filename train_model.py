"""
Simple OpenNMT Training Script - Shows dataset info
"""
import os

# Configuration
DATA_DIR = "data"
MODEL_DIR = "models/filipino_translator"
SRC_FILE = os.path.join(DATA_DIR, "train-en.txt")
TGT_FILE = os.path.join(DATA_DIR, "train-fil.txt")

print("=" * 50)
print("OpenNMT Training - English to Filipino")
print("=" * 50)

# Load training data
print("\n[1] Loading training data...")
src_data = []
tgt_data = []

with open(SRC_FILE, 'r', encoding='utf-8') as f:
    for line in f:
        src_data.append(line.strip())

with open(TGT_FILE, 'r', encoding='utf-8') as f:
    for line in f:
        tgt_data.append(line.strip())

print(f"Loaded {len(src_data)} sentence pairs")

# Build vocabulary
print("\n[2] Building vocabulary...")
src_vocab = set()
tgt_vocab = set()

for sent in src_data:
    for word in sent.split():
        src_vocab.add(word)

for sent in tgt_data:
    for word in sent.split():
        tgt_vocab.add(word)

print(f"Source vocabulary size: {len(src_vocab)}")
print(f"Target vocabulary size: {len(tgt_vocab)}")

# Create model directory
os.makedirs(MODEL_DIR, exist_ok=True)

print("\n" + "=" * 50)
print("Dataset Summary:")
print("=" * 50)
print(f"- Training pairs: {len(src_data)}")
print(f"- Source vocab: {len(src_vocab)} unique words")
print(f"- Target vocab: {len(tgt_vocab)} unique words")

# Sample translations
print("\n[3] Sample data pairs:")
for i in range(min(10, len(src_data))):
    print(f"  EN: {src_data[i]}")
    print(f"  FIL: {tgt_data[i]}")
    print()

print("\n[4] To train with OpenNMT, use:")
print("=" * 50)
print("""
# First, create a proper YAML config file:
cat > data/opennmt_config.yaml << 'EOF'
model_dir: models/filipino_translator

data:
  train:
    path_src: data/train-en.txt
    path_tgt: data/train-fil.txt

vocab_size: 10000

Encoder:
  layers: 1
  rnn_size: 256
  word_vec_size: 256

Decoder:
  layers: 1
  rnn_size: 256
  word_vec_size: 256

train:
  batch_size: 16
  max_epoch: 50
  learning_rate: 0.001
EOF

# Then train:
python -m onmt.bin.train -config data/opennmt_config.yaml
""")
print("=" * 50)
print("\nThe current translation server uses dictionary-based")
print("translation which works well for this dataset size.")
