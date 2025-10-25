# Specckit Configuration

This directory contains configuration for AI model usage in the project:

- Tasks & Planning: Using Claude for its strong reasoning and task breakdown capabilities
- Specification: Using GPT-4 for detailed technical specifications
- Execution: Using GitHub Copilot for code implementation

## Workflows

### Default Workflow
1. Plan (Claude) - Break down tasks and create execution plan
2. Specify (GPT-4) - Create technical specification
3. Execute (Copilot) - Implement the solution
4. Review (Claude) - Review against original plan

### Quick Fix Workflow
1. Execute (Copilot) - Immediate implementation
2. Review (Claude) - Brief review

## Model Configuration

Each model is configured with specific parameters:
- Temperature: Controls creativity vs determinism
- Max Tokens: Limits response length
- Custom prompts: Tailored to each role

## Usage

The configuration is automatically loaded by the Specckit tools. No manual intervention needed unless changing configurations.