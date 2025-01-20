import torch 

print("torch: ", torch.__version__)

print("GPU: ", torch.cuda.is_available())

print("CUDA VERSION: ", torch.version.cuda if torch.cuda.is_available() else None)


