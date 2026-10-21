$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assetDir = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../public'))
[IO.Directory]::CreateDirectory($assetDir) | Out-Null
function Draw-Mark($graphics, [single]$x, [single]$y, [single]$size) {
    $state = $graphics.Save()
    $lime = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#c1ff00'))
    $ink = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#181b19'))
    $pen = [Drawing.Pen]::new($ink, 3)
    $pen.StartCap = 'Round'; $pen.EndCap = 'Round'
    $rounded = [Drawing.Drawing2D.GraphicsPath]::new()
    $letter = [Drawing.Drawing2D.GraphicsPath]::new()
    try {
        $graphics.TranslateTransform($x, $y)
        $graphics.ScaleTransform($size / 96, $size / 96)
        $rounded.AddArc(0,0,40,40,180,90)
        $rounded.AddArc(56,0,40,40,270,90)
        $rounded.AddArc(56,56,40,40,0,90)
        $rounded.AddArc(0,56,40,40,90,90)
        $rounded.CloseFigure()
        $graphics.FillPath($lime, $rounded)
        $letter.AddLines([Drawing.PointF[]]@(
            [Drawing.PointF]::new(31,18), [Drawing.PointF]::new(45,18),
            [Drawing.PointF]::new(45,32), [Drawing.PointF]::new(60,32),
            [Drawing.PointF]::new(60,44), [Drawing.PointF]::new(45,44),
            [Drawing.PointF]::new(45,66)
        ))
        $letter.AddBezier(45,66,45,73,48,76,54,76)
        $letter.AddLine(54,76,60,76); $letter.AddLine(60,76,60,88); $letter.AddLine(60,88,51,88)
        $letter.AddBezier(51,88,37,88,31,81,31,67)
        $letter.AddLines([Drawing.PointF[]]@(
            [Drawing.PointF]::new(31,67), [Drawing.PointF]::new(31,44),
            [Drawing.PointF]::new(21,44), [Drawing.PointF]::new(21,32),
            [Drawing.PointF]::new(31,32), [Drawing.PointF]::new(31,18)
        ))
        $letter.CloseFigure(); $graphics.FillPath($ink, $letter)
        $graphics.DrawLine($pen,73,12,73,36); $graphics.DrawLine($pen,61,24,85,24)
        $graphics.DrawLine($pen,[single]64.5,[single]15.5,[single]81.5,[single]32.5)
        $graphics.DrawLine($pen,[single]64.5,[single]32.5,[single]81.5,[single]15.5)
    } finally {
        $graphics.Restore($state)
        $rounded.Dispose(); $letter.Dispose(); $pen.Dispose(); $lime.Dispose(); $ink.Dispose()
    }
}
foreach ($entry in @(@(64,'favicon-64.png'), @(180,'apple-touch-icon.png'), @(192,'icon-192.png'), @(512,'icon-512.png'))) {
    $bitmap = [Drawing.Bitmap]::new([int]$entry[0], [int]$entry[0])
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.SmoothingMode = 'AntiAlias'; $graphics.Clear([Drawing.Color]::Transparent)
        Draw-Mark $graphics 0 0 ([single]$entry[0])
        $bitmap.Save((Join-Path $assetDir $entry[1]), [Drawing.Imaging.ImageFormat]::Png)
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
}
# ICO with one PNG entry, without allocating native icon handles.
$png = [IO.File]::ReadAllBytes((Join-Path $assetDir 'favicon-64.png'))
$stream = [IO.MemoryStream]::new(); $writer = [IO.BinaryWriter]::new($stream)
try {
    $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]1)
    $writer.Write([byte]64); $writer.Write([byte]64); $writer.Write([byte]0); $writer.Write([byte]0)
    $writer.Write([uint16]1); $writer.Write([uint16]32)
    $writer.Write([uint32]$png.Length); $writer.Write([uint32]22); $writer.Write($png)
    [IO.File]::WriteAllBytes((Join-Path $assetDir 'favicon.ico'), $stream.ToArray())
} finally { $writer.Dispose(); $stream.Dispose() }
$card = [Drawing.Bitmap]::new(1200,630); $canvas = [Drawing.Graphics]::FromImage($card)
$white = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#f4f5f5'))
$muted = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#aeb9a4'))
$limeBrush = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#c1ff00'))
$inkBrush = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#181b19'))
$brandFont = [Drawing.Font]::new('Arial',30,[Drawing.FontStyle]::Bold,[Drawing.GraphicsUnit]::Pixel)
$headline = [Drawing.Font]::new('Arial',76,[Drawing.FontStyle]::Bold,[Drawing.GraphicsUnit]::Pixel)
$bodyFont = [Drawing.Font]::new('Arial',26,[Drawing.FontStyle]::Regular,[Drawing.GraphicsUnit]::Pixel)
try {
    $canvas.SmoothingMode = 'AntiAlias'; $canvas.TextRenderingHint = 'AntiAliasGridFit'
    $canvas.Clear([Drawing.ColorTranslator]::FromHtml('#181b19'))
    Draw-Mark $canvas 75 63 76
    $canvas.DrawString('texta', $brandFont, $white, 169, 82)
    $canvas.DrawString('Mucho texto.', $headline, $white, 68, 211)
    $canvas.FillRectangle($limeBrush,75,310,520,100)
    $canvas.DrawString('Todo claro.', $headline, $inkBrush, 78, 312)
    $canvas.DrawString('Analiza textos con inteligencia artificial.', $bodyFont, $white, 75, 459)
    $canvas.DrawString('Resumen / Sentimiento / Idioma / Palabras clave', $bodyFont, $muted, 75, 507)
    Draw-Mark $canvas 897 219 218
    $card.Save((Join-Path $assetDir 'social-card.png'), [Drawing.Imaging.ImageFormat]::Png)
} finally {
    $canvas.Dispose(); $card.Dispose(); $white.Dispose(); $muted.Dispose(); $limeBrush.Dispose(); $inkBrush.Dispose()
    $brandFont.Dispose(); $headline.Dispose(); $bodyFont.Dispose()
}
Write-Host 'Iconos y tarjeta social generados en public/.'
