'use client';
import lktheme from '@/types/colors';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const VolunteerRegistrationForm = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emergencyContact: '',
    address: '',
    phone: '',
    email: '',
  });
  const [holdHarmless, setHoldHarmless] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const getDisplayLabel = (rawName: string) => {
    let blah = '';
    let foundUpper = false;
    for (let i = 0; i < rawName.length; ++i) {
      if (rawName[i].toUpperCase() == rawName[i]) {
        blah = rawName.slice(0, i) + ' ' + rawName.slice(i);
        foundUpper = true;
      }
    }

    if (foundUpper) return blah.charAt(0).toUpperCase() + blah.slice(1);
    else return rawName.charAt(0).toUpperCase() + rawName.slice(1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!user) return;

    e.preventDefault();

    // verify fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const entry = formData[key as keyof typeof formData].trim();

      // make sure none are empty
      if (!entry) {
        newErrors[key] =
          `${key[0].toLocaleUpperCase() + getDisplayLabel(key).toLocaleLowerCase().slice(1)} is required`;
      }

      // use REGEX verification for emails and phone numbers
      if (key == 'phone') {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(entry)) {
          newErrors[key] = 'Invalid phone number format. (Ex: 0123456789)';
        }
      }

      if (key == 'email') {
        const phoneRegex =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!entry.toLowerCase().match(phoneRegex)) {
          newErrors[key] = 'Invalid email format. (Ex: name@example.com)';
        }
      }
    });

    // check if they signed the agreement
    if (!holdHarmless) {
      newErrors['holdHarmless'] = 'This field is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({}); // Clear errors if validation passes

    // Submit form data to the backend
    try {
      const response = await fetch('/api/volunteers/volunteerRegistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          authID: user.sub,
          is_staff: false,
          checked_in: false,
        }),
      });

      if (response.ok) {
        router.push('/user');
        // alert('Registration successful!');
        setFormData({
          firstName: '',
          lastName: '',
          emergencyContact: '',
          address: '',
          phone: '',
          email: '',
        });
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div
      className="max-w-[400px] w-[87vw] text-white shadow-lg mt-[160px]"
      style={{
        padding: '20px',
        backgroundColor: lktheme.brown,
        borderRadius: '8px',
      }}
    >
      <p className="text-lg mb-4">Volunteer Registration</p>
      {[
        'firstName',
        'lastName',
        'emergencyContact',
        'address',
        'phone',
        'email',
      ].map((field) => (
        <div key={field} style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            {getDisplayLabel(field)}
          </label>
          <input
            type={field === 'email' ? 'email' : 'text'}
            name={field}
            value={formData[field as keyof typeof formData]}
            onChange={handleChange}
            style={{
              color: 'black',
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            required
          />
          {errors[field] && (
            <span style={{ color: '#ff4f4f' }}>{errors[field]}</span>
          )}
        </div>
      ))}

      {/* Exculpatory Hold Harmless Agreement */}
      <div className="flex flex-col items-center gap-2 my-8">
        <p>Exculpatory Hold Harmless Agreement</p>
        <p className="text-sm text-neutral-300">
          I understand that I am working at The Love Kitchen as a volunteer by
          permission. In consideration for being permitted to work, I hereby
          agree in advance to exculpate, hold harmless, and release The Love
          Kitchen, Inc., its directors, officers, and employees from any
          liability to me if I am injured in any way—including through
          negligence—on The Love Kitchen property. I understand that I can never
          recover money damages from The Love Kitchen, Inc., or its directors,
          officers, or employees should I in the future be injured on The Love
          Kitchen property.
        </p>
        <div className="flex gap-5">
          <input
            type="checkbox"
            checked={holdHarmless}
            onChange={(e) => setHoldHarmless(e.target.checked)}
          />
          <p>
            I have read and understand this agreement. I sign it voluntarily.
          </p>
        </div>
        {errors['holdHarmless'] && (
          <p className="text-[#ff4f4f]">{errors['holdHarmless']}</p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        style={{
          padding: '10px 20px',
          backgroundColor: lktheme.darkCyan,
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Submit
      </button>
    </div>
  );
};

export default VolunteerRegistrationForm;
