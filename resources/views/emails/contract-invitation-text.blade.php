{{ __('email.greeting') }}

{{ __('email.invitation_intro') }}

{{ __('email.contract_summary_title') }} {{ $contractNumber }}
@if($performanceDate){{ __('email.summary_date') }}: {{ $performanceDate }}@if($performanceTime) {{ __('email.summary_at') }} {{ $performanceTime }}@endif

@endif
@if($location){{ __('email.summary_location') }}: {{ $location }}
@endif
{{ __('email.summary_price') }}: {{ $price }}

{{ __('email.invitation_button') }}:
{{ $signingUrl }}

@if(count($coSigners)){{ trans_choice('email.invitation_cosigners', count($coSigners), ['names' => implode(', ', $coSigners)]) }}@else{{ __('email.invitation_after_signing') }}@endif


{{ __('email.invitation_how') }}@if($expiresAt) {{ __('email.invitation_valid_until', ['date' => $expiresAt]) }}@endif


{{ __('email.invitation_questions', ['phone' => $contactPhone]) }}

{{ __('email.sign_off') }}
{{ $contactName }}
Plutz
{{ $contactEmail }} · {{ $website }}
