var configPlistHeader = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>PayloadContent</key>
	<array>
		<dict>
			<key>PayloadContent</key>
			<dict>
				<key>com.google.santa</key>
				<dict>
					<key>Forced</key>
					<array>
						<dict>
`

var configPlistFooter = `
						</dict>
					</array>
				</dict>
			</dict>
			<key>PayloadEnabled</key>
			<true/>
			<key>PayloadIdentifier</key>
			<string>0342c558-a101-4a08-a0b9-40cc00039ea5</string>
			<key>PayloadType</key>
			<string>com.apple.ManagedClient.preferences</string>
			<key>PayloadUUID</key>
			<string>0342c558-a101-4a08-a0b9-40cc00039ea5</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
		</dict>
	</array>
	<key>PayloadDescription</key>
	<string>Configuration for Santa security system.</string>
	<key>PayloadDisplayName</key>
	<string>Santa Configuration</string>
	<key>PayloadIdentifier</key>
	<string>com.google.santa</string>
	<key>PayloadOrganization</key>
	<string>My Org</string>
	<key>PayloadRemovalDisallowed</key>
	<true/>
	<key>PayloadScope</key>
	<string>System</string>
	<key>PayloadType</key>
	<string>Configuration</string>
	<key>PayloadUUID</key>
	<string>9020fb2d-cab3-420f-9268-acca4868bdd0</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>
</plist>
`

String.prototype.removePrefix = function(prefix) {
  return this.indexOf(prefix) === 0 ? this.substr(prefix.length) : this.toString();
};

function configGenerate(event) {
  event.preventDefault();

  var form = document.getElementById('configForm');
  var formValues = Array.from(form.elements);

  var config = configPlistHeader;

  formValues.filter((input) => {
    return input.type !== 'fieldset' && input.type !== 'submit';
  }).forEach((input) => {
    config += outputField(input);
  });
  config += configPlistFooter;

  download('santa.mobileconfig', config);
}

function outputField(field) {
  switch(field.type) {
    case 'select-one':
      return outputFieldSelect(field);
    case 'checkbox':
      return outputFieldCheckbox(field);
    case 'text':
      return outputFieldString(field);
    case 'number':
      return outputFieldNumber(field);
    case 'textarea':
      return outputFieldTextarea(field);
  }
  alert('Unhandled field type: ' + field.type);
}

function outputFieldSelect(field) { 
  var key = '							<key>' + field.id + '</key>';

  switch (field.id) {
    case 'ClientMode':
      switch (field.value) {
        case 'ClientMode_Monitor':
          return key + '\n' + '							<integer>1</integer>' + '\n';
        case 'ClientMode_Lockdown':
          return key + '\n' + '							<integer>2</integer>' + '\n';
        default:
          alert('Unhandled client mode: ' + field.value);
          return;
      }
    default:
      var value = field.value.removePrefix(field.id + '_');
      if (value === '') return '';
      return key + '\n							<string>' + value + '</string>\n';
  }
}

function outputFieldCheckbox(field) {
  var key = '							<key>' + field.id + '</key>';
  var val;
  if (field.checked) {
    return key + '\n' + '							<true/>' + '\n';
  }
  return key + '\n' + '							<false/>' + '\n';
}

function outputFieldString(field) { 
  // Don't output anything if the field is unset.
  if (field.value === '') { return ''; }

  var key = '							<key>' + field.id + '</key>';
  var val = '							<string>' + field.value + '</string>';
  return key + '\n' + val + '\n';
}

function outputFieldNumber(field) { 
  var key = '							<key>' + field.id + '</key>';
  var val = '							<integer>' + field.value + '</integer>';
  return key + '\n' + val + '\n';
}

// Outputs a textarea field as an array of strings.
function outputFieldTextarea(field) {
  if (field.value === '') { return ''; }

  var key = '							<key>' + field.id + '</key>';
  var val = '							<array>\n';
  field.value.split('\n').forEach((input) => {
    val += '								<string>' + input + '</string>\n';
  });
  val += '							</array>';
  return key + '\n' + val + '\n';
}

// Triggers a download of the provided data passing the filename as a hint for
// browser to store it under.
function download(filename, data) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

