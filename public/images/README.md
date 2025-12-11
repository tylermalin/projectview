# Images Directory

Upload your images to the appropriate subdirectories:

## Folder Structure

### `/images/lifecycle/`
Lifecycle event images:
- `feedstock_provisioning.png` - Feedstock provisioning event
- `feedstock_delivery.png` - Feedstock delivery event
- `pyrolysis.png` - Pyrolysis process
- `biochar_delivery.png` - Biochar delivery event
- `biochar_application.png` - Biochar application to farm field

### `/images/sensors/`
Sensor reading images:
- `feedstock_weight.png` - Feedstock weight measurement icon
- `reactor_feedstock_image.png` - Reactor feedstock image icon
- `reactor_feedstock_full.png` - Full reactor feedstock image
- `reactor_temp.png` - Reactor temperature icon
- `reactor_runtime.png` - Reactor runtime icon
- `finished_biochar_weight.png` - Finished biochar weight icon
- `soil_temp.png` - Soil temperature icon
- `baseline_carbon.png` - Baseline carbon icon
- `current_sequestration.png` - Current carbon sequestration icon

### `/images/proofs/`
Proof and evidence images:
- `soil_reading.png` - Soil reading evidence
- `satellite_1.png` - Satellite image 1
- `satellite_2.png` - Satellite image 2
- `satellite_3.png` - Satellite image 3

## Usage

Images in the `public/` folder are served at the root path. Reference them in your code like:
```typescript
imageUrl: '/images/lifecycle/feedstock_provisioning.png'
```

## Image Recommendations

- **Lifecycle images**: 96x96px or larger, square format recommended
- **Sensor icons**: 96x96px, square format
- **Full images**: 400px width or larger for detailed views
- **Proof images**: High resolution for clarity

