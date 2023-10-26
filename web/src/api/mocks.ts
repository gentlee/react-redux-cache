export const generateMockUser = (id: number) => {
  return {
    id,
    name: `User ${id}`,
    bank: generateMockBank(String(id)),
  }
}

export const generateMockBank = (staticId: string) => {
  return {
    staticId,
    name: 'Bank ' + staticId,
  }
}
