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

    // ユーザー名 "coach"、パスワード "hamache" に設定
    // ※ Vercelに公開した際、このID/PWを入力しないとアクセスできなくなります
    if (user === 'coach' && pwd === 'hamache') {
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
