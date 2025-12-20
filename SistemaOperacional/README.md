# Sistema Operacional - Tauri Kernel

Um sistema operacional simulado construído com **Tauri** (Rust) no backend e tecnologias web no frontend.

## 🚀 Funcionalidades

- **Kernel em Rust** - Backend robusto com gerenciamento de estado
- **Gerenciador de Processos** - Criar, listar e encerrar processos
- **Terminal Interativo** - Execute comandos do sistema
- **Interface Moderna** - Design escuro com gradientes e animações

## 📋 Pré-requisitos

Antes de executar, você precisa ter instalado:

1. **Node.js** (v18+) - [nodejs.org](https://nodejs.org/)
2. **Rust** - [rustup.rs](https://rustup.rs/)

Para instalar o Rust no Windows:
```powershell
winget install Rustlang.Rustup
```

## 🛠️ Instalação

1. Instale as dependências do Node.js:
```bash
npm install
```

2. Execute em modo de desenvolvimento:
```bash
npm run dev
```

3. Para criar o executável:
```bash
npm run build
```

## 📁 Estrutura do Projeto

```
SistemaOperacional/
├── src/                    # Frontend (HTML/CSS/JS)
│   ├── index.html
│   ├── styles.css
│   └── main.js
├── src-tauri/              # Backend (Rust)
│   ├── src/
│   │   └── main.rs         # Kernel e comandos
│   ├── Cargo.toml
│   ├── build.rs
│   └── tauri.conf.json
├── package.json
└── README.md
```

## 💻 Comandos do Terminal

- `help` - Mostra ajuda
- `info` - Informações do sistema
- `ps` - Lista processos ativos
- `clear` - Limpa o terminal
- `greet <nome>` - Saudação personalizada

## 🔧 API do Kernel (Comandos Tauri)

| Comando | Descrição |
|---------|-----------|
| `get_system_info` | Retorna informações do sistema |
| `create_process` | Cria um novo processo |
| `list_processes` | Lista todos os processos |
| `kill_process` | Encerra um processo pelo PID |
| `greet` | Retorna uma saudação |

## 📄 Licença

MIT License
