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
- ⌨️ Suporte a teclado  
- 🖥️ Interface básica (CLI ou gráfica futuramente)  

---

## 🛠️ Tecnologias Utilizadas

*(Pode adaptar conforme seu projeto)*

- Linguagem JS, Tauri, Rust e css 
- Assembly (x86 / x64)  
- GCC  
- NASM  
- GRUB (bootloader)  
- QEMU / VirtualBox para testes  

---

Para o usuário que baixar:
Baixar e instalar o Node.js de https://nodejs.org (apenas uma vez)
Baixar o projeto do GitHub (ZIP ou git clone)
Dar dois cliques no 
abrir_pitter_os.bat
O que o .bat faz automaticamente:
Verificação	Ação
❌ Node.js não instalado	Mostra instruções claras de como instalar
❌ Primeira execução (sem node_modules)	Roda npm install automaticamente
✅ Tudo OK	Inicia o Pitter OS
Visual do inicializador:
====================================
      PITTER OS - Inicializador
 ====================================
 [OK] Node.js encontrado!
 [INFO] Iniciando o Pitter OS...

