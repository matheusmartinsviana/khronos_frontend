import type React from "react"
import { useState } from "react"
import type { Cliente, Contato } from "@/types"

interface CadastroClienteProps {
    onSave: (cliente: Cliente) => void
    onCancel: () => void
    onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

const CadastroCliente: React.FC<CadastroClienteProps> = ({ onSave, onCancel, onShowNotification }) => {
    const [formData, setFormData] = useState({
        nome: "",
        cpf: "",
        rg: "",
        cnpj: "",
        dataNascimento: "",
        tipo: "fisica" as "fisica" | "juridica",
        observacoes: "",
    })

    const [contatos, setContatos] = useState<Contato[]>([{ id: "1", tipo: "celular", numero: "", email: "" }])
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.nome.trim()) {
            newErrors.nome = "Nome é obrigatório"
        }

        if (formData.tipo === "fisica") {
            if (!formData.cpf.trim()) {
                newErrors.cpf = "CPF é obrigatório para pessoa física"
            }
        } else {
            if (!formData.cnpj.trim()) {
                newErrors.cnpj = "CNPJ é obrigatório para pessoa jurídica"
            }
        }

        const contatosValidos = contatos.filter((c) => c.numero || c.email)
        if (contatosValidos.length === 0) {
            newErrors.contatos = "Pelo menos um contato é obrigatório"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            onShowNotification("error", "Por favor, corrija os erros no formulário")
            return
        }

        const novoCliente: Cliente = {
            id: Date.now().toString(),
            ...formData,
            contatos: contatos.filter((c) => c.numero || c.email),
        }

        onSave(novoCliente)
    }

    const handleContatoChange = (index: number, field: keyof Contato, value: string) => {
        const novosContatos = [...contatos]
        novosContatos[index] = { ...novosContatos[index], [field]: value }
        setContatos(novosContatos)
    }

    const adicionarContato = () => {
        setContatos([...contatos, { id: Date.now().toString(), tipo: "celular", numero: "", email: "" }])
    }

    const removerContato = (index: number) => {
        if (contatos.length > 1) {
            setContatos(contatos.filter((_, i) => i !== index))
        }
    }

    const formStyle: React.CSSProperties = {
        padding: "1rem",
        maxWidth: "800px",
        margin: "0 auto",
    }

    const fieldGroupStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "0.75rem",
        marginBottom: "1rem",
    }

    const fieldStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
    }

    const labelStyle: React.CSSProperties = {
        marginBottom: "0.25rem",
        fontWeight: "600",
        fontSize: "14px",
        color: "#333",
    }

    const inputStyle = (hasError: boolean): React.CSSProperties => ({
        padding: "0.5rem",
        border: `1px solid ${hasError ? "#dc3545" : "#ddd"}`,
        borderRadius: "4px",
        fontSize: "14px",
    })

    const errorStyle: React.CSSProperties = {
        color: "#dc3545",
        fontSize: "12px",
        marginTop: "0.25rem",
    }

    const radioGroupStyle: React.CSSProperties = {
        display: "flex",
        gap: "1rem",
        marginBottom: "1rem",
        padding: "0.5rem",
        backgroundColor: "#f8f9fa",
        borderRadius: "4px",
    }

    const buttonGroupStyle: React.CSSProperties = {
        display: "flex",
        gap: "0.5rem",
        marginTop: "1rem",
        justifyContent: "center",
        flexWrap: "wrap",
    }

    const buttonStyle = (variant: "primary" | "secondary"): React.CSSProperties => ({
        padding: "0.5rem 1rem",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "14px",
        backgroundColor: variant === "primary" ? "#a31c1e" : "#6c757d",
        color: "white",
    })

    const sectionStyle: React.CSSProperties = {
        marginBottom: "1rem",
        padding: "0.75rem",
        border: "1px solid #ddd",
        borderRadius: "4px",
        backgroundColor: "white",
    }

    return (
        <div style={formStyle}>
            <h2 style={{ color: "#333", marginBottom: "1rem", fontSize: "18px", textAlign: "center" }}>
                Cadastro de Cliente
            </h2>

            <form onSubmit={handleSubmit}>
                {/* Seções omitidas para brevidade — já estão no código anterior */}

                <div style={sectionStyle}>
                    <h3 style={{ color: "#333", marginBottom: "0.5rem", fontSize: "16px" }}>Contatos</h3>
                    {errors.contatos && <span style={errorStyle}>{errors.contatos}</span>}

                    {contatos.map((contato, index) => (
                        <div
                            key={contato.id}
                            style={{
                                ...fieldGroupStyle,
                                alignItems: "end",
                                marginBottom: "0.75rem",
                                padding: "0.5rem",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "4px",
                            }}
                        >
                            <div style={fieldStyle}>
                                <label style={labelStyle}>Tipo</label>
                                <select
                                    value={contato.tipo}
                                    onChange={(e) => handleContatoChange(index, "tipo", e.target.value)}
                                    style={inputStyle(false)}
                                >
                                    <option value="celular">Celular</option>
                                    <option value="comercial">Comercial</option>
                                    <option value="fixo">Fixo</option>
                                    <option value="internacional">Internacional</option>
                                </select>
                            </div>
                            <div style={fieldStyle}>
                                <label style={labelStyle}>Número</label>
                                <input
                                    type="text"
                                    value={contato.numero}
                                    onChange={(e) => handleContatoChange(index, "numero", e.target.value)}
                                    style={inputStyle(false)}
                                />
                            </div>
                            <div style={fieldStyle}>
                                <label style={labelStyle}>E-mail</label>
                                <input
                                    type="email"
                                    value={contato.email}
                                    onChange={(e) => handleContatoChange(index, "email", e.target.value)}
                                    style={inputStyle(false)}
                                />
                            </div>
                            <button type="button" onClick={() => removerContato(index)} style={buttonStyle("secondary")}>
                                Remover
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={adicionarContato} style={buttonStyle("primary")}>
                        Adicionar Contato
                    </button>
                </div>

                <div style={sectionStyle}>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Observações</label>
                        <textarea
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            style={{ ...inputStyle(false), resize: "vertical", minHeight: "60px" }}
                        />
                    </div>
                </div>

                <div style={buttonGroupStyle}>
                    <button type="submit" style={buttonStyle("primary")}>
                        Salvar
                    </button>
                    <button type="button" onClick={onCancel} style={buttonStyle("secondary")}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CadastroCliente
