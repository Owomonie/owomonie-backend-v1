export default function removeBankSuffix(bankName: string) {
  const bankIndex = bankName.indexOf(" Bank");
  if (bankIndex !== -1) {
    return bankName.slice(0, bankIndex);
  }

  return bankName;
}
