// Script to bulk replace remaining alerts and confirms
// Run this manually for each file

const remainingFiles = [
  {
    file: 'src/components/features/admin/order/Order_DeliveryStatus.jsx',
    alerts: [
      { line: 60, old: 'alert("Không thể tải danh sách đơn hàng!");', new: 'showError("Không thể tải danh sách đơn hàng!");' }
    ]
  },
  {
    file: 'src/components/features/admin/order/OrderList.jsx', 
    alerts: [
      { line: 39, old: 'alert("Không thể tải danh sách đơn hàng!");', new: 'showError("Không thể tải danh sách đơn hàng!");' }
    ]
  },
  {
    file: 'src/components/common/Layout/staff_layout/StaffLayout.jsx',
    alerts: [
      { old: 'alert(\'Please enter new password and confirm password.\');', new: 'showWarning(\'Please enter new password and confirm password.\');' },
      { old: 'alert(\'Passwords do not match!\');', new: 'showError(\'Passwords do not match!\');' },
      { old: 'alert(\'Password changed successfully!\');', new: 'showSuccess(\'Password changed successfully!\');' },
      { old: 'alert(phoneError);', new: 'showError(phoneError);' },
      { old: 'alert(\'Failed to update profile. Please try again.\');', new: 'showError(\'Failed to update profile. Please try again.\');' },
      { old: 'alert(\'Failed to change password. Please try again.\');', new: 'showError(\'Failed to change password. Please try again.\');' }
    ]
  },
  {
    file: 'src/components/common/QRCode/QRGenerator.jsx',
    alerts: [
      { old: 'alert(\'QR Code regenerated successfully!\');', new: 'showSuccess(\'QR Code regenerated successfully!\');' },
      { old: 'alert(\'Failed to regenerate QR code\');', new: 'showError(\'Failed to regenerate QR code\');' },
      { old: 'alert(\'Error regenerating QR code\');', new: 'showError(\'Error regenerating QR code\');' }
    ]
  },
  {
    file: 'src/components/common/Layout/admin_layout/AdminLayout.jsx',
    alerts: [
      { old: 'alert(\'Password changed successfully!\');', new: 'showSuccess(\'Password changed successfully!\');' },
      { old: 'alert(\'Failed to change password. Please try again.\');', new: 'showError(\'Failed to change password. Please try again.\');' },
      { old: 'alert(phoneError);', new: 'showError(phoneError);' },
      { old: 'alert(\'Failed to update profile. Please try again.\');', new: 'showError(\'Failed to update profile. Please try again.\');' }
    ]
  },
  {
    file: 'src/components/features/staff/OrderEdit.jsx',
    confirms: [
      { old: 'if (!window.confirm(\'Are you sure you want to remove this item?\')) {', new: 'const confirmed = await showConfirm({ message: \'Are you sure you want to remove this item?\', type: \'danger\', confirmText: \'Remove\' }); if (!confirmed) {' }
    ]
  },
  {
    file: 'src/components/features/admin/voucher/VoucherManagement.jsx',
    confirms: [
      { old: 'if (!window.confirm(\'Are you sure you want to delete this voucher?\')) return;', new: 'const confirmed = await showConfirm({ title: \'Delete Voucher\', message: \'Are you sure you want to delete this voucher?\', type: \'danger\', confirmText: \'Delete\' }); if (!confirmed) return;' }
    ]
  },
  {
    file: 'src/components/features/admin/order/OrderForm.jsx',
    confirms: [
      { old: 'if(window.confirm(\'Bạn có chắc chắn muốn xóa đơn hàng này không?\')) {', new: 'const confirmed = await showConfirm({ title: \'Xóa đơn hàng\', message: \'Bạn có chắc chắn muốn xóa đơn hàng này không?\', type: \'danger\', confirmText: \'Xóa\' }); if (confirmed) {' }
    ]
  },
  {
    file: 'src/components/features/admin/food/FoodList.jsx',
    confirms: [
      { old: 'if (window.confirm("Are you sure you want to delete this food item?")) {', new: 'const confirmed = await showConfirm({ title: \'Delete Food Item\', message: \'Are you sure you want to delete this food item?\', type: \'danger\', confirmText: \'Delete\' }); if (confirmed) {' }
    ]
  }
];

// Instructions for each file:
// 1. Add import: import { useNotification } from '../../../contexts/NotificationContext';
// 2. Add hook: const { showSuccess, showError, showWarning, showInfo, showConfirm } = useNotification();
// 3. Replace alerts and confirms as shown above
// 4. Make confirm functions async if they use showConfirm

console.log('Files to update:', remainingFiles.length);
console.log('Total replacements needed:', 
  remainingFiles.reduce((total, file) => 
    total + (file.alerts?.length || 0) + (file.confirms?.length || 0), 0
  )
);

export default remainingFiles; 