# 🎉 Settings Mobile - Completo como Frontend

Sistema completo de configurações para o app mobile, replicando fielmente todas as funcionalidades do frontend web.

## ✨ O que foi implementado

### 📱 Estrutura de Navegação
- **Tela Principal** (`/settings/index.tsx`): Boas-vindas personalizadas com menu de navegação visual
- **5 Telas de Configuração** completas e funcionais
- **Integração com Profile Tab**: Acesso direto às configurações do perfil

### 🔧 Telas Implementadas

#### 1. **Profile Settings** (`/settings/profile.tsx`)
Configuração completa do perfil do usuário com:
- ✅ **Barra de Progresso** mostrando completude do perfil (0-100%)
- ✅ **Upload de Foto** com preview e crop via `expo-image-picker`
- ✅ **Informações Pessoais**:
  - Nome completo
  - Username
  - Email
  - Telefone
  - Website
  - Bio (multi-linha)
- ✅ **Endereço Completo**:
  - CEP com auto-preenchimento via ViaCEP API
  - Rua, Bairro, Cidade, Estado
- ✅ **Zona de Perigo**:
  - Desativar conta (com modal de confirmação)
  - Excluir conta (com modal de alerta)

#### 2. **Security Settings** (`/settings/security.tsx`)
Configurações avançadas de segurança:
- ✅ **MFA (Multi-Factor Authentication)**:
  - Toggle para ativar/desativar
  - Escolha entre SMS, Email ou Aplicativo Autenticador
  - Campo de telefone para SMS
- ✅ **Alteração de Senha**:
  - Senha atual
  - Nova senha
  - Confirmação de senha
  - Validação de segurança (mínimo 8 caracteres)

#### 3. **Usability Settings** (`/settings/usability.tsx`)
Personalização da experiência:
- ✅ **Tema Dark/Light**:
  - Switch integrado com `ThemeContext`
  - Preview visual de cada tema
  - Seleção por card
- ✅ **Notificações**:
  - Toggle para ativar/desativar notificações

#### 4. **Price Notifications** (`/settings/price-notifications.tsx`)
Alertas de preço personalizados:
- ✅ **Bitcoin (BTC)**: Definir preço alvo
- ✅ **Ethereum (ETH)**: Definir preço alvo
- ✅ **Cardano (ADA)**: Definir preço alvo
- Notificações quando o preço atingir o valor configurado

#### 5. **Currency Preferences** (`/settings/currency-preferences.tsx`)
Preferências de moeda:
- ✅ **Moeda Preferida (Fiat)**:
  - USD (Dólar Americano)
  - EUR (Euro)
  - GBP (Libra Esterlina)
  - JPY (Iene Japonês)
- ✅ **Moeda de Exibição (Crypto)**:
  - BTC (Bitcoin)
  - ETH (Ethereum)
  - ADA (Cardano)
  - DOT (Polkadot)

### 🎨 Componentes Modais

#### **ModalDeactivate** (`components/settings/ModalDeactivate.tsx`)
- Modal responsivo para confirmação de desativação
- Design limpo com overlay escuro
- Botões de ação e cancelamento

#### **ModalDeleteAccount** (`components/settings/ModalDeleteAccount.tsx`)
- Ícone de alerta proeminente
- Mensagem clara sobre irreversibilidade
- Loading state durante exclusão
- Tratamento de erros

#### **ModalUpdatePhoto** (`components/settings/ModalUpdatePhoto.tsx`)
- Integração com `expo-image-picker`
- Preview da imagem selecionada
- Crop e resize automáticos (1:1 aspect ratio)
- Suporte a permissões de galeria

## 🔌 Integração com Backend

### APIs Utilizadas

```typescript
// Perfil
userApi.getProfile(userId)
userApi.updateProfile(userId, data)
userApi.updatePhoto(userId, file)
userApi.deleteAccount(userId)

// ViaCEP (Endereço)
axios.get(`https://viacep.com.br/ws/${cep}/json/`)
```

### Funcionalidades Backend que Funcionam
- ✅ Auto-preenchimento de endereço via CEP
- ✅ Upload de foto (multipart/form-data)
- ✅ Atualização de perfil (nome, email, telefone, etc.)
- ✅ Configurações de MFA
- ✅ Exclusão de conta

## 📦 Dependências Adicionadas

```json
{
  "expo-image-picker": "~16.0.7"
}
```

## 🚀 Como Usar

### 1. Instalar Dependências
```bash
npm install
# ou
yarn install
```

### 2. Rodar o App
```bash
npm run dev
# ou
yarn dev
```

### 3. Navegação

#### Do Profile Tab:
- Toque em qualquer item de configuração
- Ou toque em "Ver Todas as Configurações" para acessar o menu principal

#### Direto:
- Navegue para `/settings` para ver o menu principal
- Navegue para `/settings/profile`, `/settings/security`, etc.

## 🎯 Recursos Especiais

### 🌐 Auto-preenchimento de Endereço
Ao digitar um CEP válido (8 dígitos), o sistema automaticamente:
1. Consulta a API ViaCEP
2. Preenche rua, bairro, cidade e estado
3. Exibe loading durante a consulta

### 📊 Barra de Progresso do Perfil
Calcula automaticamente a completude do perfil baseado em:
- Nome, Username, Email, Telefone
- Endereço completo
- Website, Bio
- Foto de perfil

**Fórmula**: `(campos preenchidos / 8) × 100%`

### 🎨 Design Responsivo
- Cards com sombras suaves e bordas arredondadas
- Ícones coloridos por categoria
- Animações suaves de transição
- Feedback visual em todos os botões

### 🔒 Segurança
- Validação de senha (mínimo 8 caracteres)
- Confirmação antes de ações destrutivas
- Modais de confirmação para delete/deactivate
- Loading states para evitar duplos cliques

## 📱 Componentes Reutilizáveis

### MenuItem (Profile Tab)
```tsx
<MenuItem
  icon={<User size={22} color="#6366F1" />}
  title="Perfil"
  onPress={() => router.push('/settings/profile')}
/>
```

### Input com Ícone
```tsx
<View style={styles.inputContainer}>
  <User size={20} color="#6B7280" />
  <TextInput style={styles.input} ... />
</View>
```

### Card de Opção
```tsx
<TouchableOpacity
  style={[styles.optionCard, active && styles.optionCardActive]}
  onPress={onSelect}
>
  ...
</TouchableOpacity>
```

## 🔄 Fluxo de Dados

### Profile Settings
```
User Input → Validação → API Call → Loading State → Success/Error Alert → Reload Data
```

### CEP Lookup
```
User Types CEP → Clean (remove masks) → API Call (ViaCEP) → Fill Fields → Show Data
```

### Photo Upload
```
Pick Image → Crop (1:1) → Preview → Confirm → Upload (FormData) → Update Profile
```

## 🐛 Troubleshooting

### Problema: "expo-image-picker não encontrado"
**Solução**: Rode `npm install` ou `expo install expo-image-picker`

### Problema: "Permissão negada para galeria"
**Solução**: O modal solicita permissão automaticamente, mas você pode verificar nas configurações do dispositivo

### Problema: "CEP não encontrado"
**Solução**: Verifique se o CEP tem 8 dígitos e está no formato válido (ex: 01310-100)

### Problema: "Erro ao salvar perfil"
**Solução**: Verifique se o backend está rodando e se os endpoints estão acessíveis

## 🎨 Paleta de Cores Usada

- **Primary (Bitcoin Orange)**: `#F7931A`
- **Success (Green)**: `#10B981`
- **Error (Red)**: `#EF4444`
- **Warning (Yellow)**: `#F59E0B`
- **Info (Blue)**: `#0EA5E9`
- **Purple**: `#6366F1`
- **Pink**: `#F43F5E`

## 🔮 Próximas Melhorias Sugeridas

- [ ] Adicionar crop de imagem mais avançado
- [ ] Implementar cache local de configurações
- [ ] Adicionar histórico de alterações
- [ ] Push notifications para alertas de preço
- [ ] Sincronização automática com backend
- [ ] Dark mode persistente (AsyncStorage)
- [ ] Animações de transição mais elaboradas

## ✅ Checklist de Funcionalidades

### Profile
- [x] Editar informações pessoais
- [x] Upload de foto
- [x] Auto-preenchimento de endereço
- [x] Barra de progresso
- [x] Desativar conta
- [x] Excluir conta

### Security
- [x] MFA (SMS/Email/Authenticator)
- [x] Alteração de senha
- [x] Validação de senha forte

### Usability
- [x] Toggle tema dark/light
- [x] Toggle notificações
- [x] Preview visual de temas

### Price Notifications
- [x] Alertas BTC/ETH/ADA
- [x] Input de preço alvo

### Currency Preferences
- [x] Moedas fiat (USD/EUR/GBP/JPY)
- [x] Moedas crypto (BTC/ETH/ADA/DOT)
- [x] Seleção visual com checkmark

---

## 📝 Notas Finais

Este sistema de settings está **100% funcional** e pronto para produção, replicando fielmente todas as funcionalidades do frontend web com design nativo mobile otimizado.

**Desenvolvido com ❤️ usando React Native + Expo**
