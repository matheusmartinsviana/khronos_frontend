"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Package,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Download,
  AlertCircle,
} from "lucide-react"
import { importProducts, importServices } from "@/api/import"

interface ImportResult {
  success: boolean
  message: string
  count?: number
  errors?: string[]
}

export default function ImportPage() {
  const [productLoading, setProductLoading] = useState(false)
  const [serviceLoading, setServiceLoading] = useState(false)
  const [productResult, setProductResult] = useState<ImportResult | null>(null)
  const [serviceResult, setServiceResult] = useState<ImportResult | null>(null)

  const handleImportProducts = async () => {
    setProductLoading(true)
    setProductResult(null)

    try {
      const response = await importProducts()

      if (response.data) {
        const count = response.data.data ? response.data.data.length : 0
        setProductResult({
          success: true,
          message:
            count === 0
              ? "Produtos já estão importados"
              : response.data.message || "Produtos importados!",
          count: count,
        })
      } else {
        setProductResult({
          success: true,
          message: "Importação concluída!",
          count: 0,
        })
      }
    } catch (error: any) {
      console.error("Erro ao importar produtos:", error)

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erro desconhecido ao importar produtos"

      setProductResult({
        success: false,
        message: errorMessage,
        errors: error.response?.data?.errors || [],
      })
    } finally {
      setProductLoading(false)
    }
  }

  const handleImportServices = async () => {
    setServiceLoading(true)
    setServiceResult(null)

    try {
      const response = await importServices()

      if (response.data) {
        const count = response.data.data ? response.data.data.length : 0
        setServiceResult({
          success: true,
          message:
            count === 0
              ? "Serviços já estão importados"
              : response.data.message || "Serviços importados!",
          count: count,
        })
      } else {
        setServiceResult({
          success: true,
          message: "Importação concluída!",
          count: 0,
        })
      }
    } catch (error: any) {
      console.error("Erro ao importar serviços:", error)

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erro desconhecido ao importar serviços"

      setServiceResult({
        success: false,
        message: errorMessage,
        errors: error.response?.data?.errors || [],
      })
    } finally {
      setServiceLoading(false)
    }
  }

  const ResultAlert = ({ result, type }: { result: ImportResult; type: string }) => (
    <Alert className={`mt-4 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
      <div className="flex items-center gap-2 w-full">
        {result.success ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
        <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col w-full">
              <span className="flex items-center pb-2 w-100">{result.message}</span>
              {result.success && typeof result.count === "number" && result.count > 0 && (
                <Badge
                  variant="secondary"
                  className={result.count === 0 ? "bg-blue-100 text-blue-800" : "bg-green-200 text-green-800 p-2 radius-md"}
                >
                  {result.count === 0
                    ? null
                    : `${result.count} ${type} importado${result.count !== 1 ? "s" : ""}`}
                </Badge>
              )}
            </div>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-red-800 mb-1">Erros encontrados:</p>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  )

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Upload className="h-6 w-6 text-red-600" />
              Importações
            </h1>
            <p className="text-gray-600">Importe produtos e serviços a partir de planilhas</p>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Certifique-se de que as planilhas estejam no formato correto antes de iniciar a importação. O processo
              pode levar alguns minutos dependendo da quantidade de dados.
            </AlertDescription>
          </Alert>
        </div>

        {/* Import Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Products Import Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Importar Produtos</CardTitle>
                  <CardDescription>Importe produtos a partir de uma planilha</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                onClick={handleImportProducts}
                disabled={productLoading || serviceLoading}
                className="w-full p-2 cursor-pointer"
                size="lg"
              >
                {productLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando produtos...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Importar Produtos
                  </>
                )}
              </Button>

              {productResult && <ResultAlert result={productResult} type="produto" />}
            </CardContent>
          </Card>

          {/* Services Import Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Importar Serviços</CardTitle>
                  <CardDescription>Importe serviços a partir de uma planilha</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">

              <Button
                onClick={handleImportServices}
                disabled={serviceLoading || productLoading}
                className="w-full p-2 cursor-pointer"
                size="lg"
              >
                {serviceLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando serviços...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Importar Serviços
                  </>
                )}
              </Button>

              {serviceResult && <ResultAlert result={serviceResult} type="serviço" />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
