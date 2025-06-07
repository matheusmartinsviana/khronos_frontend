interface GenericListProps<T extends Record<string, any>> {
  items: T[]
  itemsHeader: Record<keyof T, string> // título amigável das colunas
  renderActions?: (item: T) => React.ReactNode // ações (editar/deletar)
  emptyMessage?: string
}

export default function GenericList<T extends Record<string, any>>({
  items,
  itemsHeader,
  renderActions,
  emptyMessage = "Nenhum resultado encontrado.",
}: GenericListProps<T>) {


  const keys = Object.keys(itemsHeader) as (keyof T)[]

  return (
    <div className="rounded-xl border py-2 shadow-sm">
      <div className="flex justify-between font-semibold p-4 border-b">
        {keys.map((key) => (
          <span
            key={String(key)}
            className="w-1/5"
          >
            {itemsHeader[key]}
          </span>
        ))}
        {renderActions && <span className="text-center w-1/5">Ações</span>}
      </div>
      <ul>
        {
          items.length === 0
            ? (<li className="text-sm text-muted-foreground p-4 text-center">{emptyMessage}</li>)
            : items.map((item, index) => (
              <li key={index} className="px-4 py-2 border-b-2 hover:bg-muted transition last:border-0">
                <div className="flex justify-between items-center">
                  {keys.map((key) => (
                    <span
                      key={String(key)}
                      className="w-1/5"
                    >
                      {item[key]}
                    </span>
                  ))}
                  {renderActions && (
                    <div className="flex gap-1 justify-center w-1/5">
                      {renderActions(item)}
                    </div>
                  )}
                </div>
              </li>
            ))}
      </ul>
    </div>
  )
}

