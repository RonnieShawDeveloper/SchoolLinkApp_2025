import { Component, forwardRef, Input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full" [class.max-w-xs]="maxXs">
      <input #textInput type="text"
             class="w-full p-2 border rounded bg-white/10 border-white/30 text-white placeholder-slate-300"
             [placeholder]="placeholder || 'DD/MM/YYYY'"
             [value]="displayValue"
             (input)="onTextInput($event)"
             (blur)="onTextBlur()"
             (keydown.enter)="onEnter()"
             [disabled]="isDisabled"/>
    </div>
  `,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerComponent),
    multi: true
  }]
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() placeholder = 'Select date';
  @Input() maxXs = true;

  value: string | null = null; // ISO yyyy-MM-dd
  displayValue = '';

  @ViewChild('textInput', { static: true }) textInputRef!: ElementRef<HTMLInputElement>;

  onChange: (v: any) => void = () => {};
  onTouched: () => void = () => {};
  isDisabled = false;

  writeValue(val: string | null): void {
    this.value = val;
    this.updateDisplay();
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled = isDisabled; }

  clear(): void {
    this.value = '';
    this.onChange('');
    this.displayValue = '';
  }

  private updateDisplay(): void {
    if (!this.value) { this.displayValue = ''; return; }
    const d = new Date(this.value);
    this.displayValue = isNaN(d.getTime()) ? '' : this.formatDDMMYYYY(d);
  }

  // Typing support for DD/MM/YYYY with immediate slashes after day and month
  onTextInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '').slice(0, 8); // keep up to DDMMYYYY (8 digits)

    let formatted = '';
    switch (digits.length) {
      case 0:
        formatted = '';
        break;
      case 1:
        formatted = digits; // D
        break;
      case 2:
        formatted = `${digits}/`; // DD/ (slash immediately after day)
        break;
      case 3:
        formatted = `${digits.slice(0,2)}/${digits.slice(2)}`; // DD/M
        break;
      case 4:
        formatted = `${digits.slice(0,2)}/${digits.slice(2,4)}/`; // DD/MM/ (slash immediately after month)
        break;
      case 5:
      case 6:
      case 7:
      case 8:
        formatted = `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`; // DD/MM/YYYY (partial year allowed)
        break;
    }
    this.displayValue = formatted;
  }

  onEnter(): void {
    this.applyTypedValue();
  }

  onTextBlur(): void {
    this.onTouched();
    this.applyTypedValue();
  }

  private applyTypedValue(): void {
    const parsed = this.parseDDMMYYYY(this.displayValue);
    if (parsed) {
      this.value = parsed;
      this.onChange(parsed);
      this.updateDisplay();
    }
    // if invalid, keep display text as-is but do not update model
  }

  private parseDDMMYYYY(text: string): string | null {
    if (!text) return '';
    const cleaned = text.trim();
    // Accept separators "/" or "-" or spaces
    const m = cleaned.match(/^([0-3]?\d)[\/\-\s]([0-1]?\d)[\/\-\s](\d{4})$/);
    if (!m) return null;
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const year = parseInt(m[3], 10);
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    const d = new Date(year, month - 1, day);
    if (isNaN(d.getTime())) return null;
    // Ensure date components round-trip (handles 31 in short months)
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
    return d.toISOString().slice(0,10); // ISO yyyy-MM-dd
  }

  private formatDDMMYYYY(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}
