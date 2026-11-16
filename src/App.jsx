import { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Container, Box } from '@mui/material';
import { api } from './api.js';
import Employees from './Employees.jsx';
import Insights from './Insights.jsx';

export default function App() {
  const [tab, setTab] = useState(0);
  const [meta, setMeta] = useState({ countries: {}, departments: [] });
  const refreshMeta = () => api.meta().then(setMeta);
  useEffect(() => { refreshMeta(); }, []);

  return (
    <>
      <AppBar position="static"><Toolbar><Typography variant="h6">ACME Salary Manager</Typography></Toolbar></AppBar>
      <Container sx={{ py: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}><Tab label="Employees" /><Tab label="Pay insights" /></Tabs>
        <Box sx={{ mt: 2 }}>
          {tab === 0 ? <Employees meta={meta} onChanged={refreshMeta} /> : <Insights meta={meta} />}
        </Box>
      </Container>
    </>
  );
}
