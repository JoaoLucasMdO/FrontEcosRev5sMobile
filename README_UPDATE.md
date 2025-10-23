Atualizações na tela de perfil (ProfileScreen)

O que foi adicionado/alterado:

- Novo layout para a tela de perfil com cartão de destaque (foto, pontos e botão "Editar Perfil").
- Seção "Informações Pessoais" exibindo: Nome Completo, CPF (somente leitura), Email, Celular e Endereço Completo.
- Modal de edição para campos individuais e modal estruturado para edição de endereço (logradouro, número, complemento, bairro, cidade, estado, CEP).
- Busca por CEP via ViaCEP para preencher automaticamente parte do endereço.
- Animação de entrada/saída do modal usando Animated.
- Integração com seleção de imagem via `expo-image-picker` (código presente). O app tenta enviar a imagem ao backend usando multipart/form-data e faz fallback para envio apenas do URI caso o backend aceite esse formato.
- Badge da câmera sobre a foto que usa a cor do tema.
- Ações rápidas: Configurações, Logout e Apagar conta.

Dependências:

- `expo-image-picker` já está listada em `package.json` (versão ^17.0.8). Se o seu ambiente não tiver instalado, execute:

```powershell
npm install
# ou
npm install expo-image-picker
```

Testes rápidos locais:

1. Instale dependências: `npm install`.
2. Inicie o app: `npm start` (ou use `npm run android` / `npm run ios`).
3. Na tela de perfil:
   - Verifique se os dados são carregados (nome, email, CPF, pontos).
   - Toque no ícone de lápis ao lado de um campo para abrir o modal de edição.
   - Toque no lápis ao lado do Endereço para abrir o formulário estruturado.
   - No campo CEP, insira um CEP válido (8 dígitos) e clique em "Buscar por CEP" para testar o ViaCEP.
   - Toque no ícone da câmera sobre a foto para selecionar uma nova imagem (requer permissão de acesso a mídia).

Notas técnicas e restrições:

- O envio da imagem ao backend tenta multipart/form-data. Se o servidor não aceitar arquivos multipart, o código tenta um fallback enviando apenas o URI no JSON. Ajuste o backend ou o endpoint conforme necessário.
- A decomposição automática de um endereço livre é heurística e pode não ser perfeita. Para dados mais confiáveis, prefira que o backend receba campos estruturados.
- Se quiser remover a animação por qualquer motivo, remova o uso de `Animated` em `src/screens/ProfileScreen.js`.

Se quiser, posso:
- Ajustar o upload para suportar pré-processamento (redimensionamento) antes do envio.
- Adicionar testes unitários para os helpers (formatCPF, formatPhone, parseAddress).
- Extrair o modal de edição para um componente separado para reutilização.
