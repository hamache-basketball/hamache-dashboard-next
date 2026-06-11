import { NextRequest, NextResponse } from 'next/server';

export const config = {
  // すべてのページ（静的ファイルやAPIを除く）にBasic認証を適用
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // ユーザー名 "hamache"、パスワード "hamayama" に設定
    // ※ セキュリティ上、本来は環境変数等を使用すべきですが、今回はハードコーディングで実装しています。
    if (user === 'hamache' && pwd === 'hamayama') {
      return NextResponse.next();
    }
  }
  
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="Secure Area"`,
    },
  });
}
