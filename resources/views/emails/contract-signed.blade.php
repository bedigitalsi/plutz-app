@extends('emails.layout', ['title' => __('email.signed_contract_client_subject'), 'preheader' => __('email.signed_preheader')])

@section('content')
<p style="margin:0 0 14px 0;">{{ __('email.greeting') }}</p>
<p style="margin:0 0 6px 0;">{{ __('email.signed_intro') }}</p>

@include('emails.partials.summary')

<p style="margin:0 0 12px 0;">{{ __('email.signed_attachment') }}</p>
<p style="margin:0 0 20px 0;">{{ __('email.signed_see_you') }} {{ __('email.invitation_questions', ['phone' => $contactPhone]) }}</p>

<p style="margin:0;">{{ __('email.sign_off') }}<br><strong>{{ $contactName }}</strong><br>Plutz</p>
@endsection
