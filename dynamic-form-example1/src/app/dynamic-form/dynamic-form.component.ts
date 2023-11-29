import { CommonModule } from '@angular/common';
import { AbstractControl, FormControlOptions, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
interface Option {
  name: string;
  value: string;
}

interface FieldConfig {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  pattern?: string;
  options?: Option[];
}
@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css'
})
export class DynamicFormComponent implements OnInit {
  form!: FormGroup;
  config!: FieldConfig[]; // Use a more accurate type definition

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    // Fetch configuration from local JSON file
    this.http.get<FieldConfig[]>('/assets/config.json').subscribe(config => {
      this.config = config;

      // Generate the form based on the configuration
      this.form = this.generateForm();
    });
  }

  generateForm(): FormGroup {
    const formGroup = this.fb.group({});
  
    this.config.forEach(field => {
      const validators: ValidatorFn[] = [];
      if (field.pattern) {
        validators.push(Validators.pattern(field.pattern));
      }
  
      let control: AbstractControl | undefined;
  
      if (field.fieldType === 'text' || field.fieldType === 'email' || field.fieldType === 'number') {
        control = this.fb.control('', validators);
      } else if (field.fieldType === 'radio' || field.fieldType === 'checkbox') {
        control = this.fb.control(false, validators);
      } else if (field.fieldType === 'dropdown') {
        const options: Record<string, AbstractControl> = {};
        field.options?.forEach(option => {
          options[option.value] = this.fb.control('', validators);
        });
        control = this.fb.group(options);
      }
  
      if (control) {
        formGroup.addControl(field.fieldName, control);
      }
    });
  
    return formGroup;
  }
  

  saveForm() {
    // Save the form data to a temporary file with a date-time stamp
    const formData = this.form.value;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // Replace this with your actual file-saving logic
    console.log('Form data:', formData);
    console.log('Saving to file with timestamp:', timestamp);
  }
}