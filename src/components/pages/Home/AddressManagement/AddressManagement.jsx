import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../../common/Layout/customer_layout';
import axios from 'axios';
import { useNotification } from '../../../../contexts/NotificationContext';
import './AddressManagement.css';

// Dữ liệu quận và phường TP.HCM (cập nhật 2024)
const HCM_DISTRICTS = [
    { id: 1, name: 'Quận 1' },
    { id: 2, name: 'Quận 2' },
    { id: 3, name: 'Quận 3' },
    { id: 4, name: 'Quận 4' },
    { id: 5, name: 'Quận 5' },
    { id: 6, name: 'Quận 6' },
    { id: 7, name: 'Quận 7' },
    { id: 8, name: 'Quận 8' },
    { id: 9, name: 'Quận 9' },
    { id: 10, name: 'Quận 10' },
    { id: 11, name: 'Quận 11' },
    { id: 12, name: 'Quận 12' },
    { id: 13, name: 'Quận Bình Tân' },
    { id: 14, name: 'Quận Bình Thạnh' },
    { id: 15, name: 'Quận Gò Vấp' },
    { id: 16, name: 'Quận Phú Nhuận' },
    { id: 17, name: 'Quận Tân Bình' },
    { id: 18, name: 'Quận Tân Phú' },
    { id: 19, name: 'Quận Thủ Đức' },
    { id: 20, name: 'Huyện Bình Chánh' },
    { id: 21, name: 'Huyện Cần Giờ' },
    { id: 22, name: 'Huyện Củ Chi' },
    { id: 23, name: 'Huyện Hóc Môn' },
    { id: 24, name: 'Huyện Nhà Bè' }
];

const HCM_WARDS = {
    1: [ // Quận 1
        { id: 1, name: 'Phường Bến Nghé' },
        { id: 2, name: 'Phường Bến Thành' },
        { id: 3, name: 'Phường Cầu Kho' },
        { id: 4, name: 'Phường Cầu Ông Lãnh' },
        { id: 5, name: 'Phường Cô Giang' },
        { id: 6, name: 'Phường Đa Kao' },
        { id: 7, name: 'Phường Nguyễn Cư Trinh' },
        { id: 8, name: 'Phường Nguyễn Thái Bình' },
        { id: 9, name: 'Phường Phạm Ngũ Lão' },
        { id: 10, name: 'Phường Tân Định' }
    ],
    2: [ // Quận 2
        { id: 11, name: 'Phường An Khánh' },
        { id: 12, name: 'Phường An Lợi Đông' },
        { id: 13, name: 'Phường An Phú' },
        { id: 14, name: 'Phường Bình An' },
        { id: 15, name: 'Phường Bình Khánh' },
        { id: 16, name: 'Phường Bình Trưng Đông' },
        { id: 17, name: 'Phường Bình Trưng Tây' },
        { id: 18, name: 'Phường Cát Lái' },
        { id: 19, name: 'Phường Thạnh Mỹ Lợi' },
        { id: 20, name: 'Phường Thảo Điền' },
        { id: 21, name: 'Phường Thủ Thiêm' }
    ],
    3: [ // Quận 3
        { id: 22, name: 'Phường 1' },
        { id: 23, name: 'Phường 2' },
        { id: 24, name: 'Phường 3' },
        { id: 25, name: 'Phường 4' },
        { id: 26, name: 'Phường 5' },
        { id: 27, name: 'Phường 6' },
        { id: 28, name: 'Phường 7' },
        { id: 29, name: 'Phường 8' },
        { id: 30, name: 'Phường 9' },
        { id: 31, name: 'Phường 10' },
        { id: 32, name: 'Phường 11' },
        { id: 33, name: 'Phường 12' },
        { id: 34, name: 'Phường 13' },
        { id: 35, name: 'Phường 14' }
    ],
    4: [ // Quận 4
        { id: 36, name: 'Phường 1' },
        { id: 37, name: 'Phường 2' },
        { id: 38, name: 'Phường 3' },
        { id: 39, name: 'Phường 4' },
        { id: 40, name: 'Phường 5' },
        { id: 41, name: 'Phường 6' },
        { id: 42, name: 'Phường 7' },
        { id: 43, name: 'Phường 8' },
        { id: 44, name: 'Phường 9' },
        { id: 45, name: 'Phường 10' },
        { id: 46, name: 'Phường 11' },
        { id: 47, name: 'Phường 12' },
        { id: 48, name: 'Phường 13' },
        { id: 49, name: 'Phường 14' },
        { id: 50, name: 'Phường 15' },
        { id: 51, name: 'Phường 16' },
        { id: 52, name: 'Phường 17' },
        { id: 53, name: 'Phường 18' }
    ],
    5: [ // Quận 5
        { id: 54, name: 'Phường 1' },
        { id: 55, name: 'Phường 2' },
        { id: 56, name: 'Phường 3' },
        { id: 57, name: 'Phường 4' },
        { id: 58, name: 'Phường 5' },
        { id: 59, name: 'Phường 6' },
        { id: 60, name: 'Phường 7' },
        { id: 61, name: 'Phường 8' },
        { id: 62, name: 'Phường 9' },
        { id: 63, name: 'Phường 10' },
        { id: 64, name: 'Phường 11' },
        { id: 65, name: 'Phường 12' },
        { id: 66, name: 'Phường 13' },
        { id: 67, name: 'Phường 14' },
        { id: 68, name: 'Phường 15' }
    ],
    6: [ // Quận 6
        { id: 69, name: 'Phường 1' },
        { id: 70, name: 'Phường 2' },
        { id: 71, name: 'Phường 3' },
        { id: 72, name: 'Phường 4' },
        { id: 73, name: 'Phường 5' },
        { id: 74, name: 'Phường 6' },
        { id: 75, name: 'Phường 7' },
        { id: 76, name: 'Phường 8' },
        { id: 77, name: 'Phường 9' },
        { id: 78, name: 'Phường 10' },
        { id: 79, name: 'Phường 11' },
        { id: 80, name: 'Phường 12' },
        { id: 81, name: 'Phường 13' },
        { id: 82, name: 'Phường 14' }
    ],
    7: [ // Quận 7
        { id: 83, name: 'Phường Bình Thuận' },
        { id: 84, name: 'Phường Phú Mỹ' },
        { id: 85, name: 'Phường Phú Thuận' },
        { id: 86, name: 'Phường Tân Hưng' },
        { id: 87, name: 'Phường Tân Kiểng' },
        { id: 88, name: 'Phường Tân Phong' },
        { id: 89, name: 'Phường Tân Phú' },
        { id: 90, name: 'Phường Tân Quy' },
        { id: 91, name: 'Phường Tân Thuận Đông' },
        { id: 92, name: 'Phường Tân Thuận Tây' }
    ],
    8: [ // Quận 8
        { id: 93, name: 'Phường 1' },
        { id: 94, name: 'Phường 2' },
        { id: 95, name: 'Phường 3' },
        { id: 96, name: 'Phường 4' },
        { id: 97, name: 'Phường 5' },
        { id: 98, name: 'Phường 6' },
        { id: 99, name: 'Phường 7' },
        { id: 100, name: 'Phường 8' },
        { id: 101, name: 'Phường 9' },
        { id: 102, name: 'Phường 10' },
        { id: 103, name: 'Phường 11' },
        { id: 104, name: 'Phường 12' },
        { id: 105, name: 'Phường 13' },
        { id: 106, name: 'Phường 14' },
        { id: 107, name: 'Phường 15' },
        { id: 108, name: 'Phường 16' }
    ],
    9: [ // Quận 9
        { id: 109, name: 'Phường Hiệp Phú' },
        { id: 110, name: 'Phường Long Bình' },
        { id: 111, name: 'Phường Long Phước' },
        { id: 112, name: 'Phường Long Thạnh Mỹ' },
        { id: 113, name: 'Phường Long Trường' },
        { id: 114, name: 'Phường Phú Hữu' },
        { id: 115, name: 'Phường Phước Bình' },
        { id: 116, name: 'Phường Phước Long A' },
        { id: 117, name: 'Phường Phước Long B' },
        { id: 118, name: 'Phường Tân Phú' },
        { id: 119, name: 'Phường Tăng Nhơn Phú A' },
        { id: 120, name: 'Phường Tăng Nhơn Phú B' },
        { id: 121, name: 'Phường Trường Thạnh' }
    ],
    10: [ // Quận 10
        { id: 122, name: 'Phường 1' },
        { id: 123, name: 'Phường 2' },
        { id: 124, name: 'Phường 3' },
        { id: 125, name: 'Phường 4' },
        { id: 126, name: 'Phường 5' },
        { id: 127, name: 'Phường 6' },
        { id: 128, name: 'Phường 7' },
        { id: 129, name: 'Phường 8' },
        { id: 130, name: 'Phường 9' },
        { id: 131, name: 'Phường 10' },
        { id: 132, name: 'Phường 11' },
        { id: 133, name: 'Phường 12' },
        { id: 134, name: 'Phường 13' },
        { id: 135, name: 'Phường 14' },
        { id: 136, name: 'Phường 15' }
    ],
    11: [ // Quận 11
        { id: 137, name: 'Phường 1' },
        { id: 138, name: 'Phường 2' },
        { id: 139, name: 'Phường 3' },
        { id: 140, name: 'Phường 4' },
        { id: 141, name: 'Phường 5' },
        { id: 142, name: 'Phường 6' },
        { id: 143, name: 'Phường 7' },
        { id: 144, name: 'Phường 8' },
        { id: 145, name: 'Phường 9' },
        { id: 146, name: 'Phường 10' },
        { id: 147, name: 'Phường 11' },
        { id: 148, name: 'Phường 12' },
        { id: 149, name: 'Phường 13' },
        { id: 150, name: 'Phường 14' },
        { id: 151, name: 'Phường 15' },
        { id: 152, name: 'Phường 16' }
    ],
    12: [ // Quận 12
        { id: 153, name: 'Phường An Phú Đông' },
        { id: 154, name: 'Phường Đông Hưng Thuận' },
        { id: 155, name: 'Phường Hiệp Thành' },
        { id: 156, name: 'Phường Tân Chánh Hiệp' },
        { id: 157, name: 'Phường Tân Hưng Thuận' },
        { id: 158, name: 'Phường Tân Thới Hiệp' },
        { id: 159, name: 'Phường Tân Thới Nhất' },
        { id: 160, name: 'Phường Thạnh Lộc' },
        { id: 161, name: 'Phường Thạnh Xuân' },
        { id: 162, name: 'Phường Thới An' },
        { id: 163, name: 'Phường Trung Mỹ Tây' }
    ],
    13: [ // Quận Bình Tân
        { id: 164, name: 'Phường An Lạc' },
        { id: 165, name: 'Phường An Lạc A' },
        { id: 166, name: 'Phường Bình Hưng Hòa' },
        { id: 167, name: 'Phường Bình Hưng Hòa A' },
        { id: 168, name: 'Phường Bình Hưng Hòa B' },
        { id: 169, name: 'Phường Bình Trị Đông' },
        { id: 170, name: 'Phường Bình Trị Đông A' },
        { id: 171, name: 'Phường Bình Trị Đông B' },
                    { id: 172, name: 'Tan Tao Ward' },
            { id: 173, name: 'Tan Tao A Ward' }
    ],
    14: [ // Quận Bình Thạnh
        { id: 174, name: 'Phường 1' },
        { id: 175, name: 'Phường 2' },
        { id: 176, name: 'Phường 3' },
        { id: 177, name: 'Phường 4' },
        { id: 178, name: 'Phường 5' },
        { id: 179, name: 'Phường 6' },
        { id: 180, name: 'Phường 7' },
        { id: 181, name: 'Phường 8' },
        { id: 182, name: 'Phường 9' },
        { id: 183, name: 'Phường 10' },
        { id: 184, name: 'Phường 11' },
        { id: 185, name: 'Phường 12' },
        { id: 186, name: 'Phường 13' },
        { id: 187, name: 'Phường 14' },
        { id: 188, name: 'Phường 15' },
        { id: 189, name: 'Phường 16' },
        { id: 190, name: 'Phường 17' },
        { id: 191, name: 'Phường 18' },
        { id: 192, name: 'Phường 19' },
        { id: 193, name: 'Phường 20' },
        { id: 194, name: 'Phường 21' },
        { id: 195, name: 'Phường 22' },
        { id: 196, name: 'Phường 23' },
        { id: 197, name: 'Phường 24' },
        { id: 198, name: 'Phường 25' },
        { id: 199, name: 'Phường 26' },
        { id: 200, name: 'Phường 27' },
        { id: 201, name: 'Phường 28' }
    ],
    15: [ // Quận Gò Vấp
        { id: 202, name: 'Phường 1' },
        { id: 203, name: 'Phường 2' },
        { id: 204, name: 'Phường 3' },
        { id: 205, name: 'Phường 4' },
        { id: 206, name: 'Phường 5' },
        { id: 207, name: 'Phường 6' },
        { id: 208, name: 'Phường 7' },
        { id: 209, name: 'Phường 8' },
        { id: 210, name: 'Phường 9' },
        { id: 211, name: 'Phường 10' },
        { id: 212, name: 'Phường 11' },
        { id: 213, name: 'Phường 12' },
        { id: 214, name: 'Phường 13' },
        { id: 215, name: 'Phường 14' },
        { id: 216, name: 'Phường 15' },
        { id: 217, name: 'Phường 16' },
        { id: 218, name: 'Phường 17' }
    ],
    16: [ // Quận Phú Nhuận
        { id: 219, name: 'Phường 1' },
        { id: 220, name: 'Phường 2' },
        { id: 221, name: 'Phường 3' },
        { id: 222, name: 'Phường 4' },
        { id: 223, name: 'Phường 5' },
        { id: 224, name: 'Phường 6' },
        { id: 225, name: 'Phường 7' },
        { id: 226, name: 'Phường 8' },
        { id: 227, name: 'Phường 9' },
        { id: 228, name: 'Phường 10' },
        { id: 229, name: 'Phường 11' },
        { id: 230, name: 'Phường 12' },
        { id: 231, name: 'Phường 13' },
        { id: 232, name: 'Phường 14' },
        { id: 233, name: 'Phường 15' },
        { id: 234, name: 'Phường 16' },
        { id: 235, name: 'Phường 17' }
    ],
    17: [ // Quận Tân Bình
        { id: 236, name: 'Phường 1' },
        { id: 237, name: 'Phường 2' },
        { id: 238, name: 'Phường 3' },
        { id: 239, name: 'Phường 4' },
        { id: 240, name: 'Phường 5' },
        { id: 241, name: 'Phường 6' },
        { id: 242, name: 'Phường 7' },
        { id: 243, name: 'Phường 8' },
        { id: 244, name: 'Phường 9' },
        { id: 245, name: 'Phường 10' },
        { id: 246, name: 'Phường 11' },
        { id: 247, name: 'Phường 12' },
        { id: 248, name: 'Phường 13' },
        { id: 249, name: 'Phường 14' },
        { id: 250, name: 'Phường 15' }
    ],
    18: [ // Quận Tân Phú
        { id: 251, name: 'Phường Hiệp Tân' },
        { id: 252, name: 'Phường Hòa Thạnh' },
        { id: 253, name: 'Phường Phú Thạnh' },
        { id: 254, name: 'Phường Phú Thọ Hòa' },
        { id: 255, name: 'Phường Phú Trung' },
        { id: 256, name: 'Phường Sơn Kỳ' },
        { id: 257, name: 'Phường Tân Quý' },
        { id: 258, name: 'Phường Tân Sơn Nhì' },
        { id: 259, name: 'Phường Tân Thành' },
        { id: 260, name: 'Phường Tân Thới Hòa' },
        { id: 261, name: 'Phường Tây Thạnh' }
    ],
    19: [ // Quận Thủ Đức
        { id: 262, name: 'Phường An Khánh' },
        { id: 263, name: 'Phường An Lợi Đông' },
        { id: 264, name: 'Phường An Phú' },
        { id: 265, name: 'Phường Bình Chiểu' },
        { id: 266, name: 'Phường Bình Thọ' },
        { id: 267, name: 'Phường Cát Lái' },
        { id: 268, name: 'Phường Hiệp Bình Chánh' },
        { id: 269, name: 'Phường Hiệp Bình Phước' },
        { id: 270, name: 'Phường Linh Chiểu' },
        { id: 271, name: 'Phường Linh Đông' },
        { id: 272, name: 'Phường Linh Tây' },
        { id: 273, name: 'Phường Linh Trung' },
        { id: 274, name: 'Phường Linh Xuân' },
        { id: 275, name: 'Phường Long Bình' },
        { id: 276, name: 'Phường Long Phước' },
        { id: 277, name: 'Phường Long Thạnh Mỹ' },
        { id: 278, name: 'Phường Long Trường' },
        { id: 279, name: 'Phường Phú Hữu' },
        { id: 280, name: 'Phường Phước Bình' },
        { id: 281, name: 'Phường Phước Long A' },
        { id: 282, name: 'Phường Phước Long B' },
        { id: 283, name: 'Phường Tam Bình' },
        { id: 284, name: 'Phường Tam Phú' },
        { id: 285, name: 'Phường Tăng Nhơn Phú A' },
        { id: 286, name: 'Phường Tăng Nhơn Phú B' },
        { id: 287, name: 'Phường Trường Thạnh' }
    ]
};

// Function để parse địa chỉ thành các thành phần
const parseAddress = (fullAddress) => {
    if (!fullAddress) return { streetAddress: '', districtId: '', wardId: '', city: '' };
    
    // Tách địa chỉ theo format: "Số nhà, Phường, Quận, Thành phố"
    const parts = fullAddress.split(', ');
    
    let streetAddress = '';
    let wardName = '';
    let districtName = '';
    let city = '';
    
    if (parts.length >= 4) {
        streetAddress = parts[0];
        wardName = parts[1];
        districtName = parts[2];
        city = parts[3];
    } else if (parts.length === 3) {
        streetAddress = parts[0];
        districtName = parts[1];
        city = parts[2];
    } else if (parts.length === 2) {
        streetAddress = parts[0];
        city = parts[1];
    } else {
        streetAddress = fullAddress;
    }
    
    // Tìm district ID từ tên
    const district = HCM_DISTRICTS.find(d => d.name === districtName);
    const districtId = district ? district.id.toString() : '';
    
    // Tìm ward ID từ tên và district
    let wardId = '';
    if (districtId && wardName) {
        const wards = HCM_WARDS[parseInt(districtId)] || [];
        const ward = wards.find(w => w.name === wardName);
        wardId = ward ? ward.id.toString() : '';
    }
    
    return {
        streetAddress,
        districtId,
        wardId,
        city
    };
};

const AddressManagement = () => {
    const navigate = useNavigate();
    const { customer } = useContext(CartContext);
    const { showError, showWarning } = useNotification();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        streetAddress: '', // Số nhà, tên đường
        districtId: '', // Quận
        wardId: '', // Phường
        city: 'Thành phố Hồ Chí Minh', // Mặc định
        latitude: null,
        longitude: null,
        note: '',
        isDefault: false
    });
    
    // State cho dropdown phường
    const [availableWards, setAvailableWards] = useState([]);
    
    // Form validation
    const [formErrors, setFormErrors] = useState({});
    
    useEffect(() => {
        if (customer) {
            fetchAddresses();
        }
    }, [customer]);
    
    const fetchAddresses = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/customer/addresses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setAddresses(response.data);
            setError(null);
        } catch (err) {
            setError('Cannot load address list. Please try again.');
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'districtId') {
            // Khi thay đổi quận, reset phường và cập nhật danh sách phường
            setFormData(prev => ({
                ...prev,
                districtId: value,
                wardId: ''
            }));
            setAvailableWards(value ? HCM_WARDS[parseInt(value)] || [] : []);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
        
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Tên người nhận là bắt buộc';
        }
        
        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Số điện thoại là bắt buộc';
        } else {
            // Validate format số điện thoại Việt Nam
            const phoneRegex = /^(\+84|0)[0-9]{9}$/;
            if (!phoneRegex.test(formData.phoneNumber.trim())) {
                errors.phoneNumber = 'Số điện thoại phải bắt đầu bằng +84 hoặc 0 và có đúng 10 số';
            }
        }
        
        if (!formData.streetAddress.trim()) {
            errors.streetAddress = 'Số nhà, tên đường là bắt buộc';
        }
        
        if (!formData.districtId) {
            errors.districtId = 'Please select district';
        }
        
        if (!formData.wardId) {
            errors.wardId = 'Please select ward';
        }
        
        if (!formData.latitude || !formData.longitude) {
            errors.latitude = 'Please select location on map or use sample location';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleAddAddress = async () => {
        if (!validateForm()) return;
        
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Create full address from components
        const selectedDistrict = HCM_DISTRICTS.find(d => d.id === parseInt(formData.districtId));
        const selectedWard = availableWards.find(w => w.id === parseInt(formData.wardId));
        
        const fullAddress = `${formData.streetAddress}, ${selectedWard?.name}, ${selectedDistrict?.name}, ${formData.city}`;
        
        const addressData = {
            ...formData,
            address: fullAddress
        };
        
        try {
            const response = await axios.post('http://localhost:8080/api/customer/addresses', addressData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setAddresses(prev => [...prev, response.data]);
            setShowAddModal(false);
            resetForm();
            setError(null); // Clear any previous errors
            setSuccessMessage('Address added successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error adding address:', err);
            if (err.response?.data?.message) {
                setError(`Error adding address: ${err.response.data.message}`);
            } else if (err.response?.data) {
                setError(`Error adding address: ${JSON.stringify(err.response.data)}`);
            } else {
                setError('Cannot add address. Please check information and try again.');
            }
        }
    };
    
    const handleEditAddress = async () => {
        if (!validateForm()) return;
        
        const token = localStorage.getItem('token');
        if (!token || !selectedAddress) return;
        
        // Create full address from components
        const selectedDistrict = HCM_DISTRICTS.find(d => d.id === parseInt(formData.districtId));
        const selectedWard = availableWards.find(w => w.id === parseInt(formData.wardId));
        
        const fullAddress = `${formData.streetAddress}, ${selectedWard?.name}, ${selectedDistrict?.name}, ${formData.city}`;
        
        const addressData = {
            ...formData,
            address: fullAddress
        };
        
        try {
            const response = await axios.put(`http://localhost:8080/api/customer/addresses/${selectedAddress.id}`, addressData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setAddresses(prev => prev.map(addr => 
                addr.id === selectedAddress.id ? response.data : addr
            ));
            setShowEditModal(false);
            resetForm();
            setError(null); // Clear any previous errors
            setSuccessMessage('Address updated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error updating address:', err);
            if (err.response?.data?.message) {
                setError(`Error updating address: ${err.response.data.message}`);
            } else if (err.response?.data) {
                setError(`Error updating address: ${JSON.stringify(err.response.data)}`);
            } else {
                setError('Cannot update address. Please check information and try again.');
            }
        }
    };
    
    const handleDeleteAddress = async () => {
        const token = localStorage.getItem('token');
        if (!token || !selectedAddress) return;
        
        try {
            await axios.delete(`http://localhost:8080/api/customer/addresses/${selectedAddress.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setAddresses(prev => prev.filter(addr => addr.id !== selectedAddress.id));
            setShowDeleteModal(false);
            setSelectedAddress(null);
            setError(null); // Clear any previous errors
            setSuccessMessage('Address deleted successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error deleting address:', err);
            if (err.response?.data?.message) {
                setError(`Error deleting address: ${err.response.data.message}`);
            } else if (err.response?.data) {
                setError(`Error deleting address: ${JSON.stringify(err.response.data)}`);
            } else {
                setError('Cannot delete address. Please try again.');
            }
        }
    };
    
    const handleSetDefault = async (addressId) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            const response = await axios.put(`http://localhost:8080/api/customer/addresses/${addressId}/default`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setAddresses(prev => prev.map(addr => ({
                ...addr,
                isDefault: addr.id === addressId
            })));
            setError(null); // Clear any previous errors
            setSuccessMessage('Set default address successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error setting default address:', err);
            if (err.response?.data?.message) {
                setError(`Error setting default address: ${err.response.data.message}`);
            } else if (err.response?.data) {
                setError(`Error setting default address: ${JSON.stringify(err.response.data)}`);
            } else {
                setError('Cannot set default address. Please try again.');
            }
        }
    };
    
    const openAddModal = () => {
        resetForm();
        setError(null);
        setSuccessMessage(null);
        setShowAddModal(true);
    };
    
    const openEditModal = (address) => {
        setSelectedAddress(address);
        
        // Parse địa chỉ để tách ra các thành phần
        const addressParts = parseAddress(address.address);
        
        setFormData({
            name: address.name,
            phoneNumber: address.phoneNumber,
            streetAddress: addressParts.streetAddress,
            districtId: '', // Không pre-fill quận, để user chọn lại
            wardId: '', // Không pre-fill phường, để user chọn lại
            city: 'Thành phố Hồ Chí Minh', // Chỉ pre-fill thành phố
            latitude: address.latitude,
            longitude: address.longitude,
            note: address.note || '',
            isDefault: address.isDefault
        });
        
        // Reset available wards về empty
        setAvailableWards([]);
        
        setError(null);
        setSuccessMessage(null);
        setShowEditModal(true);
    };
    
    const openDeleteModal = (address) => {
        setSelectedAddress(address);
        setShowDeleteModal(true);
    };
    
    const resetForm = () => {
        setFormData({
            name: '',
            phoneNumber: '',
            streetAddress: '',
            districtId: '',
            wardId: '',
            city: 'Thành phố Hồ Chí Minh',
            latitude: null,
            longitude: null,
            note: '',
            isDefault: false
        });
        setFormErrors({});
        setSelectedAddress(null);
        setAvailableWards([]);
    };
    
    const closeModal = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        resetForm();
    };
    
    if (!customer) {
        return (
            <div className="address-management-container">
                <div className="login-required">
                    <h2>Please login to manage addresses</h2>
                    <button 
                        className="login-btn"
                        onClick={() => navigate('/login/customer')}
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="address-management-container">
            <div className="breadcrumb">
                <span onClick={() => navigate('/')}>Home</span>
                <span> • </span>
                <span>Address Management</span>
            </div>
            
            <div className="address-header">
                <h1>Delivery Address Management</h1>
                <button className="add-address-btn" onClick={openAddModal}>
                    + Add New Address
                </button>
            </div>
            
            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}
            
            {successMessage && (
                <div className="success-message">
                    {successMessage}
                    <button onClick={() => setSuccessMessage(null)}>×</button>
                </div>
            )}
            
            {loading ? (
                <div className="loading-message">
                    <span className="loading-spinner"></span>
                    Loading addresses...
                </div>
            ) : addresses.length === 0 ? (
                <div className="empty-addresses">
                    <div className="empty-icon">📍</div>
                    <h3 className="empty-title">No addresses yet</h3>
                    <p className="empty-description">Add delivery addresses for convenience when ordering</p>
                    <button className="add-first-address-btn" onClick={openAddModal}>
                        Add First Address
                    </button>
                </div>
            ) : (
                <div className="addresses-list">
                    {addresses.map(address => (
                        <div key={address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                            <div className="address-header-info">
                                <div className="address-name">{address.name}</div>
                                <div className="address-phone">{address.phoneNumber}</div>
                            </div>
                            <div className="address-details">
                                <p className="address-text">{address.address}</p>
                                {address.note && (
                                    <p className="address-note">Note: {address.note}</p>
                                )}
                            </div>
                            <div className="address-actions">
                                <button 
                                    className="action-btn edit"
                                    onClick={() => openEditModal(address)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="action-btn delete"
                                    onClick={() => openDeleteModal(address)}
                                >
                                    Delete
                                </button>
                                {!address.isDefault && (
                                    <button 
                                        className="action-btn default"
                                        onClick={() => handleSetDefault(address.id)}
                                    >
                                        Set as Default
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Add Address Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Add New Address</h3>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-content">
                            <AddressForm 
                                formData={formData}
                                formErrors={formErrors}
                                handleInputChange={handleInputChange}
                                availableWards={availableWards}
                                onMapLocationSelect={() => setShowMapModal(true)}
                            />
                            <div className="modal-actions">
                                <button className="modal-btn secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button className="modal-btn primary" onClick={handleAddAddress}>
                                    Add Address
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Address Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Edit Address</h3>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-content">
                            <AddressForm 
                                formData={formData}
                                formErrors={formErrors}
                                handleInputChange={handleInputChange}
                                availableWards={availableWards}
                                onMapLocationSelect={() => setShowMapModal(true)}
                            />
                            <div className="modal-actions">
                                <button className="modal-btn secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button className="modal-btn primary" onClick={handleEditAddress}>
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Address Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Confirm Delete</h3>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="delete-confirmation">
                                <div className="warning-icon">⚠️</div>
                                <h4>Are you sure you want to delete this address?</h4>
                                <p>Address: <strong>{selectedAddress?.address}</strong></p>
                                <p>Recipient: <strong>{selectedAddress?.name}</strong></p>
                                <p className="warning-text">This action cannot be undone.</p>
                            </div>
                            <div className="modal-actions">
                                <button className="modal-btn secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button className="modal-btn danger" onClick={handleDeleteAddress}>
                                    Delete Address
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Map Selection Modal */}
            {showMapModal && (
                <MapModal
                    isOpen={showMapModal}
                    onClose={() => setShowMapModal(false)}
                    onLocationSelect={(location) => {
                        setFormData(prev => ({
                            ...prev,
                            latitude: location.lat,
                            longitude: location.lng
                        }));
                        setShowMapModal(false);
                    }}
                    showError={showError}
                    showWarning={showWarning}
                />
            )}
        </div>
    );
};

// Map Modal Component
const MapModal = ({ isOpen, onClose, onLocationSelect, showError, showWarning }) => {
    const mapRef = useRef(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [marker, setMarker] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    // Chỉ load Google Maps script 1 lần duy nhất
    useEffect(() => {
        if (!window.google || !window.google.maps) {
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCeCOd3-DjnqJqhgGSKGGR2MuiQDZzSIPo&libraries=places';
            script.async = true;
            document.body.appendChild(script);
            script.onload = () => setMapInstance(null); // trigger lại effect dưới nếu cần
        }
    }, []);

            // Initialize map when modal opens and DOM has ref
    useEffect(() => {
        if (!isOpen) return;
        if (!window.google || !window.google.maps) return;
        if (!mapRef.current) return;

        // Clear cũ
        if (mapInstance) {
            // remove old marker
            if (marker) marker.setMap(null);
        }

        // Init map
        const hcmCenter = { lat: 10.7769, lng: 106.7009 };
        const map = new window.google.maps.Map(mapRef.current, {
            center: hcmCenter,
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        // Click to place marker
        map.addListener('click', (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            if (isWithinHCMCity(lat, lng)) {
                setSelectedLocation({ lat, lng });
                if (marker) marker.setMap(null);
                const newMarker = new window.google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    title: 'Vị trí giao hàng'
                });
                setMarker(newMarker);
            } else {
                showError('Vị trí phải nằm trong nội thành Hồ Chí Minh!');
            }
        });

        setMapInstance(map);

        // Cleanup
        return () => {
            if (marker) marker.setMap(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, mapRef.current, window.google && window.google.maps]);

    const isWithinHCMCity = (lat, lng) => {
        const hcmBounds = { north: 11.2, south: 10.3, east: 107.0, west: 106.4 };
        return lat >= hcmBounds.south && lat <= hcmBounds.north &&
            lng >= hcmBounds.west && lng <= hcmBounds.east;
    };

    const handleConfirmLocation = () => {
        if (selectedLocation) {
            onLocationSelect(selectedLocation);
            onClose();
        } else {
            showWarning('Please select location on map!');
        }
    };

    const handleDemoLocation = () => {
        const demoLocation = { lat: 10.7769, lng: 106.7009 };
        onLocationSelect(demoLocation);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container map-modal">
                <div className="modal-header">
                    <h3>Select Location on Map</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-content">
                    <div className="map-selection-container">
                        <div className="map-instructions">
                            <p>📍 Click on map to select delivery location</p>
                            <p>🗺️ Location must be within Ho Chi Minh City</p>
                            {selectedLocation && (
                                <p className="selected-coordinates">
                                    ✅ Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                                </p>
                            )}
                        </div>
                        <div className="map-area">
                            {/* Quan trọng: div này phải luôn render khi isOpen=true */}
                            <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
                        </div>
                        <div className="map-actions">
                            <button className="modal-btn secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button 
                                className="modal-btn secondary" 
                                onClick={handleDemoLocation}
                            >
                                Demo Location
                            </button>
                            <button 
                                className="modal-btn primary" 
                                onClick={handleConfirmLocation}
                                disabled={!selectedLocation}
                            >
                                Confirm Location
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Address Form Component
const AddressForm = ({ formData, formErrors, handleInputChange, availableWards, onMapLocationSelect }) => {
    return (
        <div className="address-form">
            <div className="form-row">
                <div className="form-group">
                    <label>Recipient Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter recipient name"
                        className={formErrors.name ? 'error' : ''}
                    />
                    {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>
                
                <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        className={formErrors.phoneNumber ? 'error' : ''}
                    />
                    {formErrors.phoneNumber && <span className="error-message">{formErrors.phoneNumber}</span>}
                </div>
            </div>
            
            <div className="form-group">
                <label>House Number and Street Name *</label>
                <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="Example: 123 Nguyen Hue"
                    className={formErrors.streetAddress ? 'error' : ''}
                />
                {formErrors.streetAddress && <span className="error-message">{formErrors.streetAddress}</span>}
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>District *</label>
                    <select
                        name="districtId"
                        value={formData.districtId}
                        onChange={handleInputChange}
                        className={formErrors.districtId ? 'error' : ''}
                    >
                        <option value="">Select district</option>
                        {HCM_DISTRICTS.map(district => (
                            <option key={district.id} value={district.id}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                    {formErrors.districtId && <span className="error-message">{formErrors.districtId}</span>}
                </div>
                
                <div className="form-group">
                    <label>Ward *</label>
                    <select
                        name="wardId"
                        value={formData.wardId}
                        onChange={handleInputChange}
                        className={formErrors.wardId ? 'error' : ''}
                        disabled={!formData.districtId}
                    >
                        <option value="">Select ward</option>
                        {availableWards.map(ward => (
                            <option key={ward.id} value={ward.id}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                    {formErrors.wardId && <span className="error-message">{formErrors.wardId}</span>}
                </div>
            </div>
            
            <div className="form-group">
                <label>City</label>
                <input
                    type="text"
                    name="city"
                    value={formData.city}
                    disabled
                    className="disabled-input"
                />
                <small className="form-help">Default: Ho Chi Minh City</small>
            </div>
            
            <div className="form-group">
                <label>Map Location *</label>
                <div className="map-container">
                    <div className="map-placeholder coming-soon" id="map">
                        <div className="map-placeholder-content">
                            <div className="map-placeholder-icon">🗺️</div>
                            <p><strong>Coming Soon</strong></p>
                            <small>Map feature will be updated soon</small>
                            <button 
                                type="button" 
                                className="demo-location-btn"
                                onClick={() => {
                                    handleInputChange({
                                        target: { name: 'latitude', value: 10.7769 }
                                    });
                                    handleInputChange({
                                        target: { name: 'longitude', value: 106.7009 }
                                    });
                                }}
                            >
                                Use sample location (HCMC)
                            </button>
                        </div>
                    </div>
                    {formData.latitude && formData.longitude && (
                        <div className="coordinates-display">
                            <span>Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</span>
                            <button 
                                type="button" 
                                className="clear-coordinates-btn"
                                onClick={() => {
                                    handleInputChange({
                                        target: {
                                            name: 'latitude',
                                            value: null
                                        }
                                    });
                                    handleInputChange({
                                        target: {
                                            name: 'longitude',
                                            value: null
                                        }
                                    });
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>
                {formErrors.latitude && <span className="error-message">{formErrors.latitude}</span>}
            </div>
            
            <div className="form-group">
                <label>Note</label>
                <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Additional note (optional)"
                    rows="2"
                />
            </div>
            
            <div className="form-group checkbox-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Set as default address
                </label>
            </div>
        </div>
    );
};

export default AddressManagement; 