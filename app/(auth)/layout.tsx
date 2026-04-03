export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className='flex flex-col w-full grow bg-[#eee]'>
      {children}
    </main>
  )
}