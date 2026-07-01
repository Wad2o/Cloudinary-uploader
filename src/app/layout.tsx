import './globals.css'

export const metadata = {
  title: 'Cloudinary Uploader',
  description: 'Upload images to Cloudinary',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}