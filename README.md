# 🖥️ Pitter OS

🚧 **Pitter OS** é um sistema operacional **em desenvolvimento**, criado com foco em aprendizado, desempenho e liberdade para experimentação em baixo nível.

> ⚠️ Este projeto ainda está em fase inicial e não é recomendado para uso em ambientes de produção.

---

## 📌 Visão Geral

O **Pitter OS** nasce como um projeto educacional e experimental, com o objetivo de explorar como um sistema operacional funciona internamente, desde o boot até o gerenciamento de processos e memória.

Principais objetivos:
- Aprender e aplicar conceitos de sistemas operacionais
- Criar um kernel próprio
- Evoluir de forma modular e organizada
- Manter o código simples e didático

---

## ✨ Características (Planejadas)

- 🧠 Kernel próprio  
- ⚙️ Gerenciamento básico de processos  
- 💾 Gerenciamento de memória  
- ⌨️ Suporte a teclado  
- 🖥️ Interface básica (CLI ou gráfica futuramente)  
- 📂 Sistema de arquivos simples  
- 🔌 Drivers básicos  

---

## 🛠️ Tecnologias Utilizadas

*(Pode adaptar conforme seu projeto)*

- Linguagem C  
- Assembly (x86 / x64)  
- GCC  
- NASM  
- GRUB (bootloader)  
- QEMU / VirtualBox para testes  

---

## 🚀 Como Executar (Emulador)

```bash
# Exemplo genérico
make
qemu-system-x86_64 pitteros.iso
