@extends('emails.layout', ['title' => __('email.contract_invitation_subject'), 'preheader' => __('email.invitation_preheader')])

@section('content')
<p style="margin:0 0 14px 0;">{{ __('email.greeting') }}</p>
<p style="margin:0 0 6px 0;">{{ __('email.invitation_intro') }}</p>

@include('emails.partials.summary')

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 22px 0;">
  <tr><td align="center">
    <a href="{{ $signingUrl }}" style="display:inline-block; background:#171513; color:#FFFFFF; text-decoration:none; font-weight:600; font-size:16px; padding:14px 30px; border-radius:8px;">{{ __('email.invitation_button') }}</a>
  </td></tr>
</table>

@if(count($coSigners))
<p style="margin:0 0 12px 0;">{{ trans_choice('email.invitation_cosigners', count($coSigners), ['names' => implode(', ', $coSigners)]) }}</p>
@else
<p style="margin:0 0 12px 0;">{{ __('email.invitation_after_signing') }}</p>
@endif

<p style="margin:0 0 12px 0;">{{ __('email.invitation_how') }}@if($expiresAt) {{ __('email.invitation_valid_until', ['date' => $expiresAt]) }}@endif</p>

<p style="margin:0 0 20px 0;">{{ __('email.invitation_questions', ['phone' => $contactPhone]) }}</p>

<p style="margin:0;">{{ __('email.sign_off') }}<br><strong>{{ $contactName }}</strong><br>Plutz</p>

<p style="margin:26px 0 0 0; padding-top:14px; border-top:1px solid #EEE8DE; font-size:12px; line-height:1.5; color:#8C847B;">{{ __('email.invitation_fallback') }}<br><a href="{{ $signingUrl }}" style="color:#A3886E; word-break:break-all;">{{ $signingUrl }}</a></p>
@endsection
