<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>{{ $title ?? 'Plutz' }}</title>
</head>
<body style="margin:0; padding:0; background:#F7F5EF; -webkit-text-size-adjust:100%;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">{{ $preheader ?? '' }}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5EF;">
  <tr>
    <td align="center" style="padding:28px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td align="center" style="padding:0 0 18px 0; font-family:Georgia,'Times New Roman',serif; font-size:15px; letter-spacing:6px; color:#A3886E;">PLUTZ</td>
        </tr>
        <tr>
          <td style="background:#FFFFFF; border-radius:10px; padding:32px 28px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:15px; line-height:1.6; color:#171513;">
            @yield('content')
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:18px 8px 0 8px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:12px; line-height:1.6; color:#8C847B;">
            Plutz &middot; KUD Tempo Bela krajina<br>
            <a href="mailto:{{ $contactEmail }}" style="color:#8C847B;">{{ $contactEmail }}</a> &middot; {{ $contactPhone }} &middot; <a href="https://{{ $website }}" style="color:#8C847B;">{{ $website }}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
