# Contributing to DFashion

Thank you for your interest in contributing to DFashion! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- Basic knowledge of Angular and Node.js

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/DFashion.git
   cd DFashion
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Start development servers**
   ```bash
   # Frontend (Terminal 1)
   cd frontend
   ng serve
   
   # Backend (Terminal 2)
   cd backend
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style

#### Frontend (Angular)
- Use **TypeScript** with strict mode
- Follow **Angular Style Guide**
- Use **reactive forms** over template-driven forms
- Implement **OnPush** change detection where possible
- Use **standalone components** for new features

#### Backend (Node.js)
- Use **ES6+** features
- Follow **RESTful API** conventions
- Implement proper **error handling**
- Use **async/await** over callbacks
- Add **JSDoc** comments for functions

### Naming Conventions

#### Files and Directories
- Use **kebab-case** for file names
- Use **PascalCase** for component classes
- Use **camelCase** for variables and functions

#### Git Branches
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical fixes
- `refactor/component-name` - Code refactoring

### Commit Messages

Follow the **Conventional Commits** specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add role-based authentication
fix(cart): resolve item quantity update issue
docs(readme): update installation instructions
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test        # Unit tests
npm run test:watch  # Watch mode
npm run e2e         # End-to-end tests
```

### Backend Testing
```bash
cd backend
npm test           # Unit tests
npm run test:watch # Watch mode
npm run test:integration # Integration tests
```

### Test Requirements
- **Unit tests** for all new functions
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- Maintain **80%+ code coverage**

## 📋 Pull Request Process

### Before Submitting
1. **Create a feature branch** from `main`
2. **Write tests** for your changes
3. **Run all tests** and ensure they pass
4. **Update documentation** if needed
5. **Follow code style** guidelines

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Tests added for new functionality
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No merge conflicts

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes
```

## 🐛 Bug Reports

### Before Reporting
1. **Search existing issues** for duplicates
2. **Test with latest version**
3. **Reproduce the bug** consistently

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Node.js version: [e.g., 16.14.0]
- Angular version: [e.g., 15.2.0]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this be implemented?

## Alternatives Considered
Other solutions you've considered

## Additional Context
Any other relevant information
```

## 📚 Documentation

### Documentation Standards
- Use **Markdown** for all documentation
- Include **code examples** where applicable
- Keep documentation **up-to-date** with code changes
- Use **clear and concise** language

### Documentation Types
- **API Documentation** - Document all endpoints
- **Component Documentation** - Document component inputs/outputs
- **Setup Guides** - Installation and configuration
- **User Guides** - How to use features

## 🔒 Security

### Security Guidelines
- **Never commit** sensitive information
- Use **environment variables** for secrets
- Follow **OWASP** security guidelines
- Report security issues **privately**

### Reporting Security Issues
Email security issues to: [security@dfashion.com]

## 📞 Getting Help

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat (if available)

### Code Review Process
1. **Automated checks** run on PR creation
2. **Maintainer review** within 48 hours
3. **Address feedback** and update PR
4. **Final approval** and merge

## 🏆 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

## 📄 License

By contributing to DFashion, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to DFashion! 🛍️✨
