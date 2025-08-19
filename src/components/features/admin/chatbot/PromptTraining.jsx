import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
  PriorityHigh as PriorityIcon,
  Visibility as ViewIcon,
  ToggleOn as ToggleIcon
} from '@mui/icons-material';
import api from '../../../../api/axiosConfig';
import './PromptTraining.css';

const PromptTraining = () => {
  const [prompts, setPrompts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: '',
    userExamples: '',
    assistantExamples: '',
    language: 'en',
    active: true,
    priority: 1
  });

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/chat/prompts');
      setPrompts(response.data);
    } catch (error) {
      showSnackbar('Error loading prompts: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (prompt = null) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData({
        name: prompt.name,
        systemPrompt: prompt.systemPrompt,
        userExamples: prompt.userExamples || '',
        assistantExamples: prompt.assistantExamples || '',
        language: prompt.language,
        active: prompt.active,
        priority: prompt.priority
      });
    } else {
      setEditingPrompt(null);
      setFormData({
        name: '',
        systemPrompt: '',
        userExamples: '',
        assistantExamples: '',
        language: 'en',
        active: true,
        priority: 1
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPrompt(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingPrompt) {
        await api.put(`/admin/chat/prompts/${editingPrompt.id}`, formData);
        showSnackbar('Prompt updated successfully!', 'success');
      } else {
        await api.post('/admin/chat/prompts', formData);
        showSnackbar('Prompt created successfully!', 'success');
      }
      handleCloseDialog();
      loadPrompts();
    } catch (error) {
      showSnackbar('Error saving prompt: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await api.delete(`/admin/chat/prompts/${id}`);
        showSnackbar('Prompt deleted successfully!', 'success');
        loadPrompts();
      } catch (error) {
        showSnackbar('Error deleting prompt: ' + error.message, 'error');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.post(`/admin/chat/prompts/${id}/toggle`);
      showSnackbar('Prompt status updated!', 'success');
      loadPrompts();
    } catch (error) {
      showSnackbar('Error updating status: ' + error.message, 'error');
    }
  };

  const createDemoData = async () => {
    try {
      setLoading(true);
      const response = await api.post('/admin/chat/prompts/demo-data');
      showSnackbar(response.data, 'success');
      loadPrompts();
    } catch (error) {
      showSnackbar('Error creating demo data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getLanguageColor = (language) => {
    switch (language) {
      case 'en': return 'primary';
      case 'vi': return 'secondary';
      case 'all': return 'success';
      default: return 'default';
    }
  };

  const getLanguageLabel = (language) => {
    switch (language) {
      case 'en': return 'English';
      case 'vi': return 'Vietnamese';
      case 'all': return 'All Languages';
      default: return language;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Prompt Training
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Train your AI chatbot with custom prompts and examples
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={createDemoData}
            disabled={loading}
            startIcon={<SchoolIcon />}
          >
            Create Demo Data
          </Button>
          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
            startIcon={<AddIcon />}
            disabled={loading}
          >
            Add New Prompt
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Prompts
              </Typography>
              <Typography variant="h4" component="div">
                {prompts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Prompts
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {prompts.filter(p => p.active).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                English Prompts
              </Typography>
              <Typography variant="h4" component="div" color="primary.main">
                {prompts.filter(p => p.language === 'en').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Vietnamese Prompts
              </Typography>
              <Typography variant="h4" component="div" color="secondary.main">
                {prompts.filter(p => p.language === 'vi').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Prompts Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prompts.map((prompt) => (
                <TableRow key={prompt.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {prompt.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {prompt.systemPrompt.substring(0, 80)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getLanguageLabel(prompt.language)}
                      color={getLanguageColor(prompt.language)}
                      size="small"
                      icon={<LanguageIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`Priority ${prompt.priority}`}
                      color="default"
                      size="small"
                      icon={<PriorityIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={prompt.active}
                          onChange={() => handleToggleStatus(prompt.id, prompt.active)}
                          color="success"
                        />
                      }
                      label={prompt.active ? 'Active' : 'Inactive'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(prompt.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(prompt)}
                          color="info"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Prompt">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(prompt)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Prompt">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(prompt.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Prompt Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                label="Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="vi">Vietnamese</MenuItem>
                <MenuItem value="all">All Languages</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="System Prompt"
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              fullWidth
              multiline
              rows={4}
              required
              helperText="Define the AI's role and behavior"
            />

            <TextField
              label="User Examples (one per line)"
              value={formData.userExamples}
              onChange={(e) => setFormData({ ...formData, userExamples: e.target.value })}
              fullWidth
              multiline
              rows={3}
              helperText="Example user questions to train the AI"
            />

            <TextField
              label="Assistant Examples (one per line)"
              value={formData.assistantExamples}
              onChange={(e) => setFormData({ ...formData, assistantExamples: e.target.value })}
              fullWidth
              multiline
              rows={3}
              helperText="Example responses for the AI to learn from"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 10 }}
                sx={{ width: 120 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    color="success"
                  />
                }
                label="Active"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.name || !formData.systemPrompt}
          >
            {loading ? 'Saving...' : (editingPrompt ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PromptTraining; 