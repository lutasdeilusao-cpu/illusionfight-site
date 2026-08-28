// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Unico comando exposto: encerrar a shell. Serve ao botao "Fechar" da barra
// da Demo, garantindo que o jogador nunca fique preso na aplicacao.
#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
  app.exit(0);
  // Garantia final: se por algum motivo o runtime nao encerrar o processo,
  // forca a saida para o jogador nunca ficar preso.
  std::process::exit(0);
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![quit_app])
    .run(tauri::generate_context!())
    .expect("failed to run Illusion Fight Demo shell");
}
