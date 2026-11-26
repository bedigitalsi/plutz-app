<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5EF; border-radius:8px; margin:22px 0;">
  <tr><td style="padding:16px 18px; font-size:14px; line-height:1.7; color:#171513;">
    <div style="font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#A3886E; margin-bottom:6px;">{{ __('email.contract_summary_title') }} {{ $contractNumber }}</div>
    @if($performanceDate)<div><span style="color:#6B635A;">{{ __('email.summary_date') }}:</span> <strong>{{ $performanceDate }}</strong>@if($performanceTime) {{ __('email.summary_at') }} {{ $performanceTime }}@endif</div>@endif
    @if($location)<div><span style="color:#6B635A;">{{ __('email.summary_location') }}:</span> <strong>{{ $location }}</strong></div>@endif
    <div><span style="color:#6B635A;">{{ __('email.summary_price') }}:</span> <strong>{{ $price }}</strong></div>
  </td></tr>
</table>
