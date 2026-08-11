Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = 'ACTUALIZAR COMPORTAMIENTO ASISTENTE'
$form.Size = New-Object System.Drawing.Size(650, 455)
$form.BackColor = [System.Drawing.Color]::FromArgb(18, 18, 18)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false

$label = New-Object System.Windows.Forms.Label
$label.Text = 'Pega o escribe las nuevas instrucciones del Asistente abajo:'
$label.ForeColor = [System.Drawing.Color]::FromArgb(212, 175, 55)
$label.Font = New-Object System.Drawing.Font('Segoe UI', 10.5, [System.Drawing.FontStyle]::Bold)
$label.Location = New-Object System.Drawing.Point(20, 15)
$label.Size = New-Object System.Drawing.Size(600, 30)
$form.Controls.Add($label)

$textBox = New-Object System.Windows.Forms.TextBox
$textBox.Multiline = $true
$textBox.ScrollBars = 'Vertical'
$textBox.Size = New-Object System.Drawing.Size(590, 270)
$textBox.Location = New-Object System.Drawing.Point(20, 50)
$textBox.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$textBox.ForeColor = [System.Drawing.Color]::White
$textBox.Font = New-Object System.Drawing.Font('Consolas', 10)
$textBox.BorderStyle = 'FixedSingle'

# Ubicar el directorio actual del script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$configPath = Join-Path $scriptDir "public\asistente_config.json"

if (Test-Path $configPath) {
    $current = Get-Content $configPath -Raw | ConvertFrom-Json
    if ($current.systemInstructions) {
        $textBox.Text = $current.systemInstructions
    }
}
$form.Controls.Add($textBox)

$btn = New-Object System.Windows.Forms.Button
$btn.Text = 'GUARDAR Y SUBIR A PRODUCCIÓN'
$btn.Size = New-Object System.Drawing.Size(260, 42)
$btn.Location = New-Object System.Drawing.Point(185, 345)
$btn.BackColor = [System.Drawing.Color]::FromArgb(212, 175, 55)
$btn.ForeColor = [System.Drawing.Color]::Black
$btn.FlatStyle = 'Flat'
$btn.Font = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
$btn.DialogResult = [System.Windows.Forms.DialogResult]::OK
$form.Controls.Add($btn)

$form.AcceptButton = $btn

$result = $form.ShowDialog()
if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
    $cleanText = $textBox.Text.Replace("`r`n", "`n").Replace("`r", "`n")
    $json = @{ systemInstructions = $cleanText } | ConvertTo-Json
    Set-Content -Path $configPath -Value $json -Encoding UTF8
    exit 0
} else {
    exit 1
}
