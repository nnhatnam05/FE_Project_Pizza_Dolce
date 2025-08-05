import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { validatePhoneNumber } from '../../../../../utils/phoneValidation';
import './AddressSelection.css';

const AddressSelection = ({ onAddressSelect, selectedAddress, onClose }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '',
        phoneNumber: '',
        address: '',
        latitude: null,
        longitude: null,
        note: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to access your addresses');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/customer/addresses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAddresses(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setError('Failed to load addresses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAddress = (address) => {
        onAddressSelect({
            addressId: address.id,
            deliveryAddress: address.address,
            recipientName: address.name,
            recipientPhone: address.phoneNumber,
            latitude: address.latitude,
            longitude: address.longitude,
            note: address.note
        });
        onClose();
    };

    // Using imported validatePhoneNumber function

    const handleNewAddressSubmit = async () => {
        if (!newAddress.name || !newAddress.phoneNumber || !newAddress.address) {
            setError('Please fill in all required fields');
            return;
        }

        // Validate phone number
        const phoneError = validatePhoneNumber(newAddress.phoneNumber);
        if (phoneError) {
            setError(phoneError);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to save address');
            return;
        }

        try {
            setSaving(true);
            const response = await axios.post('http://localhost:8080/api/customer/addresses', newAddress, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Select the newly created address
            handleSelectAddress(response.data);
        } catch (error) {
            console.error('Error creating address:', error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Failed to save address. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCoordinateChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({
            ...prev,
            [name]: value ? parseFloat(value) : null
        }));
    };

    if (loading) {
        return (
            <div className="address-selection-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your addresses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="address-selection-container">
            <div className="address-selection-header">
                <h3>Select Delivery Address</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Saved Addresses */}
            <div className="saved-addresses">
                <h4>Your Saved Addresses</h4>
                {addresses.length === 0 ? (
                    <div className="no-addresses">
                        <p>No saved addresses found.</p>
                    </div>
                ) : (
                    <div className="address-list">
                        {addresses.map(address => (
                            <div 
                                key={address.id} 
                                className={`address-item ${selectedAddress?.addressId === address.id ? 'selected' : ''}`}
                                onClick={() => handleSelectAddress(address)}
                            >
                                <div className="address-info">
                                    <div className="address-name">{address.name}</div>
                                    <div className="address-phone">{address.phoneNumber}</div>
                                    <div className="address-text">{address.address}</div>
                                    {address.note && (
                                        <div className="address-note">Note: {address.note}</div>
                                    )}
                                    {address.isDefault && (
                                        <span className="default-badge">Default</span>
                                    )}
                                </div>
                                <div className="address-actions">
                                    <button className="select-btn">Select</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Address Form */}
            <div className="new-address-section">
                <div className="section-header">
                    <h4>Add New Address</h4>
                    <button 
                        className="toggle-form-btn"
                        onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                    >
                        {showNewAddressForm ? 'Cancel' : 'Add New Address'}
                    </button>
                </div>

                {showNewAddressForm && (
                    <div className="new-address-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Recipient Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newAddress.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter recipient name"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={newAddress.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Address *</label>
                            <textarea
                                name="address"
                                value={newAddress.address}
                                onChange={handleInputChange}
                                placeholder="Enter detailed address (must be within Ho Chi Minh City)"
                                className="form-input form-textarea"
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Latitude (optional)</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={newAddress.latitude || ''}
                                    onChange={handleCoordinateChange}
                                    placeholder="10.7769"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Longitude (optional)</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={newAddress.longitude || ''}
                                    onChange={handleCoordinateChange}
                                    placeholder="106.7009"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Note (optional)</label>
                            <textarea
                                name="note"
                                value={newAddress.note}
                                onChange={handleInputChange}
                                placeholder="Additional delivery instructions"
                                className="form-input form-textarea"
                                rows="2"
                            />
                        </div>

                        <div className="form-actions">
                            <button 
                                className="save-address-btn"
                                onClick={handleNewAddressSubmit}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save & Select Address'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Map Integration Placeholder */}
            <div className="map-integration">
                <div className="map-placeholder">
                    <div className="map-icon">🗺️</div>
                    <p>Google Maps integration coming soon!</p>
                    <p className="map-note">You can manually enter coordinates or use the address field above.</p>
                </div>
            </div>
        </div>
    );
};

export default AddressSelection; 