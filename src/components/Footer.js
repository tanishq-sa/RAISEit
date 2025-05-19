import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#000000] py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          {/* Logo */}
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-xl font-bold text-[#ffffff]">
              <span
                className="tracking-tighter uppercase"
                style={{
                  fontFamily: "'Truck Machine', sans-serif",
                  // fontWeight: 1000,
                  letterSpacing: '0.02em',
                  fontSize: '2.3rem',
                  lineHeight: 1.1,
                  display: 'inline-block'
                }}
              >
                RAISE<span style={{ textTransform: 'lowercase', marginLeft: '0.03em', fontWeight: 700 }}>it</span>
              </span>
            </Link>
          </div>
          
          {/* Footer Links */}
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link href="/about" className="text-sm text-[#d1d5db] hover:text-[#ffffff]">
              About
            </Link>
            <Link href="/contact" className="text-sm text-[#d1d5db] hover:text-[#ffffff]">
              Contact
            </Link>
            <Link href="/privacy" className="text-sm text-[#d1d5db] hover:text-[#ffffff]">
              Privacy Policy
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-[#d1d5db] hover:text-[#ffffff]"
            >
              GitHub
            </a>
          </div>
        </div>
        
        {/* Attribution */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#9ca3af]">
            Made with <span className="text-[#ef4444]">❤️</span> for our classroom by Tanishq Saini, Himali m Suresh
          </p>
        </div>
      </div>
    </footer>
  );
} 