// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::Mutex;
use tauri::State;

// ============================================
// KERNEL - Estado Central do Sistema (Ubuntu Edition)
// ============================================

/// Representa informações do sistema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os_name: String,
    pub version: String,
    pub kernel_type: String,
}

/// Representa um processo do sistema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Process {
    pub id: u32,
    pub name: String,
    pub status: String,
    pub memory_usage: u64,
}

/// Estado do Kernel - gerencia todo o sistema
pub struct Kernel {
    processes: Mutex<Vec<Process>>,
    next_pid: Mutex<u32>,
    system_info: SystemInfo,
}

impl Kernel {
    pub fn new() -> Self {
        Kernel {
            processes: Mutex::new(Vec::new()),
            next_pid: Mutex::new(1),
            system_info: SystemInfo {
                os_name: String::from("Ubuntu 24.04 LTS"),
                version: String::from("PitterOS Edition"),
                kernel_type: String::from("Linux (via WSL)"),
            },
        }
    }

    /// Executa um comando real no WSL
    pub fn execute_bash(&self, command: &str) -> Result<String, String> {
        let output = Command::new("wsl")
            .arg("-e")
            .arg("bash")
            .arg("-c")
            .arg(command)
            .output()
            .map_err(|e| format!("Falha ao executar comando: {}", e))?;

        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).to_string())
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    /// Cria um novo processo (agora apenas simbólico ou mapeado)
    pub fn create_process(&self, name: &str) -> Process {
        let mut pid = self.next_pid.lock().unwrap();
        let process = Process {
            id: *pid,
            name: name.to_string(),
            status: String::from("running"),
            memory_usage: 1024,
        };
        *pid += 1;

        let mut processes = self.processes.lock().unwrap();
        processes.push(process.clone());

        process
    }

    /// Lista todos os processos reais do WSL
    pub fn list_processes(&self) -> Vec<Process> {
        match self.execute_bash("ps -eo pid,comm,stat,rss --no-headers") {
            Ok(output) => {
                output.lines().filter_map(|line| {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if parts.len() >= 4 {
                        let id = parts[0].parse::<u32>().unwrap_or(0);
                        let name = parts[1].to_string();
                        let status = match parts[2] {
                            s if s.starts_with('R') => "running",
                            s if s.starts_with('S') => "sleeping",
                            s if s.starts_with('Z') => "zombie",
                            _ => "idle"
                        }.to_string();
                        let memory_usage = parts[3].parse::<u64>().unwrap_or(0);
                        
                        Some(Process { id, name, status, memory_usage })
                    } else {
                        None
                    }
                }).collect()
            },
            Err(_) => Vec::new()
        }
    }

    /// Mata um processo real no WSL
    pub fn kill_process(&self, pid: u32) -> Result<(), String> {
        let cmd = format!("kill -9 {}", pid);
        match self.execute_bash(&cmd) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Erro ao matar processo Linux {}: {}", pid, e))
        }
    }

    /// Retorna informações do sistema
    pub fn get_system_info(&self) -> SystemInfo {
        self.system_info.clone()
    }
}

// ============================================
// COMANDOS TAURI - Interface com o Frontend
// ============================================

/// Comando: Executar comando no Bash do WSL
#[tauri::command]
fn run_bash_command(command: String, kernel: State<Kernel>) -> Result<String, String> {
    kernel.execute_bash(&command)
}

/// Comando: Obter informações do sistema
#[tauri::command]
fn get_system_info(kernel: State<Kernel>) -> SystemInfo {
    kernel.get_system_info()
}

/// Comando: Criar um novo processo
#[tauri::command]
fn create_process(name: String, kernel: State<Kernel>) -> Process {
    kernel.create_process(&name)
}

/// Comando: Listar todos os processos
#[tauri::command]
fn list_processes(kernel: State<Kernel>) -> Vec<Process> {
    kernel.list_processes()
}

/// Comando: Matar um processo
#[tauri::command]
fn kill_process(pid: u32, kernel: State<Kernel>) -> Result<String, String> {
    kernel.kill_process(pid)?;
    Ok(format!("Processo {} terminado com sucesso", pid))
}

/// Comando: Saudação simples
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Pitter OS (Ubuntu) - Bem-vindo, {}!", name)
}

// ============================================
// PONTO DE ENTRADA DO APLICATIVO
// ============================================

fn main() {
    let kernel = Kernel::new();

    tauri::Builder::default()
        .manage(kernel)
        .invoke_handler(tauri::generate_handler![
            greet,
            get_system_info,
            create_process,
            list_processes,
            kill_process,
            run_bash_command
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao executar a aplicação Tauri");
}

