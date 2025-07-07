import React, { useState, useEffect, useRef } from 'react';
import { US_STATES, USState } from '../../data/usStates';

export interface AddressData {
  full_name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface AddressAutocompletePlaceholder {
  address_line_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

interface AddressAutocompleteProps {
  address: AddressData;
  onChange: (address: AddressData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
  submitLabel?: string;
}

// US Cities database (subset for demonstration - in production this would be more comprehensive)
const MAJOR_US_CITIES = [
  { city: 'New York', state: 'NY', postal_code: '10001' },
  { city: 'Los Angeles', state: 'CA', postal_code: '90001' },
  { city: 'Chicago', state: 'IL', postal_code: '60601' },
  { city: 'Houston', state: 'TX', postal_code: '77001' },
  { city: 'Phoenix', state: 'AZ', postal_code: '85001' },
  { city: 'Philadelphia', state: 'PA', postal_code: '19101' },
  { city: 'San Antonio', state: 'TX', postal_code: '78201' },
  { city: 'San Diego', state: 'CA', postal_code: '92101' },
  { city: 'Dallas', state: 'TX', postal_code: '75201' },
  { city: 'San Jose', state: 'CA', postal_code: '95101' },
  { city: 'Austin', state: 'TX', postal_code: '78701' },
  { city: 'Jacksonville', state: 'FL', postal_code: '32201' },
  { city: 'Fort Worth', state: 'TX', postal_code: '76101' },
  { city: 'Columbus', state: 'OH', postal_code: '43201' },
  { city: 'Charlotte', state: 'NC', postal_code: '28201' },
  { city: 'San Francisco', state: 'CA', postal_code: '94101' },
  { city: 'Indianapolis', state: 'IN', postal_code: '46201' },
  { city: 'Seattle', state: 'WA', postal_code: '98101' },
  { city: 'Denver', state: 'CO', postal_code: '80201' },
  { city: 'Washington', state: 'DC', postal_code: '20001' },
  { city: 'Boston', state: 'MA', postal_code: '02101' },
  { city: 'El Paso', state: 'TX', postal_code: '79901' },
  { city: 'Nashville', state: 'TN', postal_code: '37201' },
  { city: 'Detroit', state: 'MI', postal_code: '48201' },
  { city: 'Oklahoma City', state: 'OK', postal_code: '73101' },
  { city: 'Portland', state: 'OR', postal_code: '97201' },
  { city: 'Las Vegas', state: 'NV', postal_code: '89101' },
  { city: 'Memphis', state: 'TN', postal_code: '38101' },
  { city: 'Louisville', state: 'KY', postal_code: '40201' },
  { city: 'Baltimore', state: 'MD', postal_code: '21201' },
  { city: 'Milwaukee', state: 'WI', postal_code: '53201' },
  { city: 'Albuquerque', state: 'NM', postal_code: '87101' },
  { city: 'Tucson', state: 'AZ', postal_code: '85701' },
  { city: 'Fresno', state: 'CA', postal_code: '93701' },
  { city: 'Mesa', state: 'AZ', postal_code: '85201' },
  { city: 'Sacramento', state: 'CA', postal_code: '95814' },
  { city: 'Atlanta', state: 'GA', postal_code: '30301' },
  { city: 'Kansas City', state: 'MO', postal_code: '64101' },
  { city: 'Colorado Springs', state: 'CO', postal_code: '80901' },
  { city: 'Miami', state: 'FL', postal_code: '33101' },
  { city: 'Raleigh', state: 'NC', postal_code: '27601' },
  { city: 'Omaha', state: 'NE', postal_code: '68101' },
  { city: 'Long Beach', state: 'CA', postal_code: '90802' },
  { city: 'Virginia Beach', state: 'VA', postal_code: '23451' },
  { city: 'Oakland', state: 'CA', postal_code: '94601' },
  { city: 'Minneapolis', state: 'MN', postal_code: '55401' },
  { city: 'Tulsa', state: 'OK', postal_code: '74101' },
  { city: 'Tampa', state: 'FL', postal_code: '33601' },
  { city: 'Arlington', state: 'TX', postal_code: '76001' },
  { city: 'New Orleans', state: 'LA', postal_code: '70112' }
];

// ZIP code validation pattern
const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;

// Street address common patterns for suggestions
const STREET_SUFFIXES = [
  'St', 'Street', 'Ave', 'Avenue', 'Rd', 'Road', 'Blvd', 'Boulevard', 
  'Dr', 'Drive', 'Ln', 'Lane', 'Ct', 'Court', 'Pl', 'Place', 'Way', 'Circle'
];

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  address,
  onChange,
  onSubmit,
  onCancel,
  isLoading = false,
  title = "Add New Address",
  submitLabel = "Save Address"
}) => {
  const [citySuggestions, setCitySuggestions] = useState<typeof MAJOR_US_CITIES>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [postalCodeValidation, setPostalCodeValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: '' });
  
  const cityInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const addressDropdownRef = useRef<HTMLDivElement>(null);

  // Handle city autocomplete
  const handleCityChange = (value: string) => {
    onChange({ ...address, city: value });
    
    if (value.length > 1) {
      const matches = MAJOR_US_CITIES.filter(city =>
        city.city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setCitySuggestions(matches);
      setShowCitySuggestions(matches.length > 0);
    } else {
      setShowCitySuggestions(false);
    }
  };

  // Handle address line 1 autocomplete (basic street suffix suggestions)
  const handleAddressChange = (value: string) => {
    onChange({ ...address, address_line_1: value });
    
    const words = value.trim().split(' ');
    const lastWord = words[words.length - 1];
    
    if (lastWord.length > 0 && words.length > 1) {
      const matchingSuffixes = STREET_SUFFIXES.filter(suffix =>
        suffix.toLowerCase().startsWith(lastWord.toLowerCase())
      );
      
      if (matchingSuffixes.length > 0 && !matchingSuffixes.includes(lastWord)) {
        const suggestions = matchingSuffixes.map(suffix => {
          const baseAddress = words.slice(0, -1).join(' ');
          return `${baseAddress} ${suffix}`;
        }).slice(0, 5);
        
        setAddressSuggestions(suggestions);
        setShowAddressSuggestions(true);
      } else {
        setShowAddressSuggestions(false);
      }
    } else {
      setShowAddressSuggestions(false);
    }
  };

  // Handle postal code validation
  const handlePostalCodeChange = (value: string) => {
    onChange({ ...address, postal_code: value });
    
    if (value.length > 0) {
      if (ZIP_PATTERN.test(value)) {
        setPostalCodeValidation({ isValid: true, message: '✓ Valid ZIP code' });
      } else if (value.length === 5 && /^\d{5}$/.test(value)) {
        setPostalCodeValidation({ isValid: true, message: '✓ Valid ZIP code' });
      } else {
        setPostalCodeValidation({ isValid: false, message: 'Invalid ZIP code format (use 12345 or 12345-6789)' });
      }
    } else {
      setPostalCodeValidation({ isValid: true, message: '' });
    }
  };

  // Select city suggestion
  const selectCitySuggestion = (cityData: typeof MAJOR_US_CITIES[0]) => {
    onChange({
      ...address,
      city: cityData.city,
      state: cityData.state,
      postal_code: address.postal_code || cityData.postal_code
    });
    setShowCitySuggestions(false);
  };

  // Select address suggestion
  const selectAddressSuggestion = (suggestion: string) => {
    onChange({ ...address, address_line_1: suggestion });
    setShowAddressSuggestions(false);
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node) &&
          cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false);
      }
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(event.target as Node) &&
          addressInputRef.current && !addressInputRef.current.contains(event.target as Node)) {
        setShowAddressSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <form onSubmit={onSubmit} className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Full Name */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-800">Full Name</label>
          <input
            type="text"
            value={address.full_name}
            onChange={(e) => onChange({ ...address, full_name: e.target.value })}
            required
            className="p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:border-primary"
            placeholder="Enter your full name"
          />
        </div>

        {/* Address Line 1 with Autocomplete */}
        <div className="flex flex-col relative">
          <label className="mb-2 font-semibold text-gray-800">Street Address</label>
          <input
            ref={addressInputRef}
            type="text"
            value={address.address_line_1}
            onChange={(e) => handleAddressChange(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:border-primary"
            placeholder="123 Main Street"
          />
          {showAddressSuggestions && (
            <div
              ref={addressDropdownRef}
              className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
            >
              {addressSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => selectAddressSuggestion(suggestion)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-800">Address Line 2 (Optional)</label>
          <input
            type="text"
            value={address.address_line_2}
            onChange={(e) => onChange({ ...address, address_line_2: e.target.value })}
            className="p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:border-primary"
            placeholder="Apartment, suite, etc."
          />
        </div>

        {/* City with Autocomplete */}
        <div className="flex flex-col relative">
          <label className="mb-2 font-semibold text-gray-800">City</label>
          <input
            ref={cityInputRef}
            type="text"
            value={address.city}
            onChange={(e) => handleCityChange(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:border-primary"
            placeholder="Enter city name"
          />
          {showCitySuggestions && (
            <div
              ref={cityDropdownRef}
              className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
            >
              {citySuggestions.map((cityData, index) => (
                <div
                  key={index}
                  onClick={() => selectCitySuggestion(cityData)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-semibold">{cityData.city}, {cityData.state}</div>
                  <div className="text-sm text-gray-600">{cityData.postal_code}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* State Dropdown */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-800">State</label>
          <select
            value={address.state}
            onChange={(e) => onChange({ ...address, state: e.target.value })}
            required
            className="p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:border-primary bg-white"
          >
            <option value="">Select State</option>
            {US_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name} ({state.code})
              </option>
            ))}
          </select>
        </div>

        {/* Postal Code with Validation */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-800">ZIP Code</label>
          <input
            type="text"
            value={address.postal_code}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            required
            className={`p-3 border rounded-md text-base focus:outline-none focus:border-primary ${
              postalCodeValidation.isValid ? 'border-gray-300' : 'border-red-500'
            }`}
            placeholder="12345 or 12345-6789"
            maxLength={10}
          />
          {postalCodeValidation.message && (
            <div className={`text-sm mt-1 ${postalCodeValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {postalCodeValidation.message}
            </div>
          )}
        </div>
      </div>

      {/* Default Address Checkbox */}
      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          id="is-default"
          checked={address.is_default}
          onChange={(e) => onChange({ ...address, is_default: e.target.checked })}
          className="mr-2 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="is-default" className="font-semibold text-gray-800">
          Set as default address
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="bg-transparent border border-gray-600 text-gray-600 py-3 px-6 rounded-md font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-600 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !postalCodeValidation.isValid}
          className="bg-primary text-white py-3 px-6 rounded-md font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{isLoading ? 'Saving...' : submitLabel}</span>
        </button>
      </div>
    </form>
  );
};

export default AddressAutocomplete;