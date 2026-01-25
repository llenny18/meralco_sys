import { FC, useState, useEffect, ChangeEvent } from 'react';
import { 
  Container, Grid, Card, CardHeader, CardContent, Divider, Box, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, 
  Typography, Tooltip, IconButton, Chip, FormControl, InputLabel, Select, 
  MenuItem, Paper, Stack, CardMedia, CardActionArea
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const MEDIA_BASE_URL = 'http://127.0.0.1:8000/api';
const ENDPOINT = 'work-order-documents';

interface Document {
  id: number;
  document_type: string;
  document_name: string;
  upload_date: string;
  is_approved: boolean;
  file: string;
}

export default function VendorDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/`);
      if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
      const data = await response.json();
      setDocuments(Array.isArray(data) ? data : data.results || []);
    } catch (err: any) {
      setError(err.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAdd = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleDelete = async (doc: Document) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/${doc.id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Failed to delete: ${response.statusText}`);
      showSuccess('Document deleted successfully!');
      fetchDocuments();
    } catch (err: any) {
      setError('Error deleting document: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error(`Failed to save: ${response.statusText}`);
      showSuccess('Document added successfully!');
      setShowModal(false);
      fetchDocuments();
    } catch (err: any) {
      setError('Error saving document: ' + err.message);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const getFileExtension = (filePath: string): string => {
    if (!filePath) return '';
    const parts = filePath.split('.');
    return parts[parts.length - 1].toLowerCase();
  };

  const isImageFile = (filePath: string): boolean => {
    const ext = getFileExtension(filePath);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
  };

  const isPdfFile = (filePath: string): boolean => {
    return getFileExtension(filePath) === 'pdf';
  };

  const getFileIcon = (filePath: string) => {
    if (isImageFile(filePath)) return <ImageIcon sx={{ fontSize: 48, color: '#4CAF50' }} />;
    if (isPdfFile(filePath)) return <PictureAsPdfIcon sx={{ fontSize: 48, color: '#f44336' }} />;
    return <InsertDriveFileIcon sx={{ fontSize: 48, color: '#9e9e9e' }} />;
  };

  const getFullMediaUrl = (filePath: string): string => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return `${MEDIA_BASE_URL}/${filePath}`;
  };

  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc);
    setShowPreviewModal(true);
  };

  const handleDownload = (doc: Document) => {
    const url = getFullMediaUrl(doc.file);
    window.open(url, '_blank');
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Box sx={{ minHeight: '100vh',py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                📁 Document Manager
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload and manage your project documents
              </Typography>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={2}>
                <Button
                  variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('grid')}
                  size="small"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('list')}
                  size="small"
                >
                  List
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddTwoToneIcon />}
                  onClick={handleAdd}
                  sx={{ ml: 2 }}
                >
                  Upload Document
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Alerts */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body1" color="text.secondary">Loading documents...</Typography>
          </Box>
        )}

        {/* Empty State */}
        {!loading && documents.length === 0 && (
          <Paper sx={{ textAlign: 'center', py: 8 }}>
            <FolderIcon sx={{ fontSize: 80, color: '#bdbdbd', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No documents yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Click "Upload Document" to add your first file
            </Typography>
            <Button variant="contained" startIcon={<AddTwoToneIcon />} onClick={handleAdd}>
              Upload Document
            </Button>
          </Paper>
        )}

        {/* Grid View */}
        {!loading && documents.length > 0 && viewMode === 'grid' && (
          <Grid container spacing={3}>
            {documents.map((doc) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea onClick={() => handlePreview(doc)}>
                    <Box
                      sx={{
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f5f5f5',
                        position: 'relative'
                      }}
                    >
                      {isImageFile(doc.file) ? (
                        <CardMedia
                          component="img"
                          image={getFullMediaUrl(doc.file)}
                          alt={doc.document_name}
                          sx={{ height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        getFileIcon(doc.file)
                      )}
                      {doc.is_approved && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Approved"
                          color="success"
                          size="small"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                        />
                      )}
                      {!doc.is_approved && (
                        <Chip
                          icon={<PendingIcon />}
                          label="Pending"
                          color="warning"
                          size="small"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                        />
                      )}
                    </Box>
                  </CardActionArea>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {doc.document_name || 'Untitled'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {doc.document_type || 'General'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(doc.upload_date)}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-around' }}>
                    <Tooltip title="Preview">
                      <IconButton size="small" color="primary" onClick={() => handlePreview(doc)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton size="small" color="info" onClick={() => handleDownload(doc)}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(doc)}>
                        <DeleteTwoToneIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* List View */}
        {!loading && documents.length > 0 && viewMode === 'list' && (
          <Paper>
            <Box sx={{ p: 2 }}>
              {documents.map((doc, index) => (
                <Box key={doc.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 2,
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <Box sx={{ flexShrink: 0 }}>{getFileIcon(doc.file)}</Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {doc.document_name || 'Untitled'}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {doc.document_type || 'General'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(doc.upload_date)}
                        </Typography>
                        {doc.is_approved ? (
                          <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" />
                        ) : (
                          <Chip icon={<PendingIcon />} label="Pending" color="warning" size="small" />
                        )}
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Preview">
                        <IconButton size="small" color="primary" onClick={() => handlePreview(doc)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton size="small" color="info" onClick={() => handleDownload(doc)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(doc)}>
                          <DeleteTwoToneIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                  {index < documents.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Container>

      {/* Add Document Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>📤 Upload New Document</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Document Name"
                  value={formData.document_name || ''}
                  onChange={(e) => handleInputChange('document_name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Document Type"
                  value={formData.document_type || ''}
                  onChange={(e) => handleInputChange('document_type', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="File Path"
                  value={formData.file || ''}
                  onChange={(e) => handleInputChange('file', e.target.value)}
                  placeholder="e.g., media/work_order_documents/2026/01/file.pdf"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Approval Status</InputLabel>
                  <Select
                    value={formData.is_approved === true ? 'true' : formData.is_approved === false ? 'false' : ''}
                    onChange={(e) => handleInputChange('is_approved', e.target.value === 'true')}
                    label="Approval Status"
                  >
                    <MenuItem value="">Select...</MenuItem>
                    <MenuItem value="true">Approved</MenuItem>
                    <MenuItem value="false">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Modal */}
      <Dialog
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{previewDocument?.document_name}</Typography>
            <IconButton onClick={() => handleDownload(previewDocument!)} color="primary">
              <DownloadIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {previewDocument && (
            <Box sx={{ textAlign: 'center' }}>
              {isImageFile(previewDocument.file) ? (
                <img
                  src={getFullMediaUrl(previewDocument.file)}
                  alt={previewDocument.document_name}
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
              ) : isPdfFile(previewDocument.file) ? (
                <iframe
                  src={getFullMediaUrl(previewDocument.file)}
                  style={{ width: '100%', height: '70vh', border: 'none' }}
                  title={previewDocument.document_name}
                />
              ) : (
                <Box sx={{ py: 8 }}>
                  {getFileIcon(previewDocument.file)}
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Preview not available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click download to view this file
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreviewModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}