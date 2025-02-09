export default function removeBankSuffix(bankName: string) {
  if (bankName.endsWith(" Bank")) {
    return bankName.slice(0, -5);
  }
  return bankName;
}
