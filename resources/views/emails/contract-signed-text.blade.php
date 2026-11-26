{{ __('email.greeting') }}

{{ __('email.signed_intro') }}

{{ __('email.contract_summary_title') }} {{ $contractNumber }}
@if($performanceDate){{ __('email.summary_date') }}: {{ $performanceDate }}@if($performanceTime) {{ __('email.summary_at') }} {{ $performanceTime }}@endif

@endif
@if($location){{ __('email.summary_location') }}: {{ $location }}
@endif
{{ __('email.summary_price') }}: {{ $price }}

{{ __('email.signed_attachment') }}

{{ __('email.signed_see_you') }} {{ __('email.invitation_questions', ['phone' => $contactPhone]) }}

{{ __('email.sign_off') }}
{{ $contactName }}
Plutz
{{ $contactEmail }} · {{ $website }}
