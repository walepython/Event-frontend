import QRScanner from "../components/QRScanner";

export default function ScanPage() {
  const token = JSON.parse(localStorage.getItem("authTokens"))?.access;

  return <QRScanner token={token} />;
}
