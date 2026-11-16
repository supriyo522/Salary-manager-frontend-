import { useEffect, useState, useCallback } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination, TableSortLabel, TextField, MenuItem,
  Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import { api, fmt } from './api.js';

const EMPTY = { name: '', email: '', jobTitle: '', department: '', country: 'US', salary: '', hireDate: '' };

export default function Employees({ meta, onChanged }) {
  const [data, setData] = useState({ items: [], total: 0 });
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [sort, setSort] = useState('name');
  const [dir, setDir] = useState('asc');
  const [editing, setEditing] = useState(null); // null | employee | EMPTY

  const load = useCallback(() => {
    const params = { page: page + 1, limit, sort, dir };
    if (q) params.q = q;
    if (country) params.country = country;
    if (department) params.department = department;
    api.employees(params).then(setData);
  }, [page, limit, sort, dir, q, country, department]);

  // Debounce: typing in search must not fire a request per keystroke
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const toggleSort = (key) => { setDir(sort === key && dir === 'asc' ? 'desc' : 'asc'); setSort(key); };
  const col = (key, label) => (
    <TableCell><TableSortLabel active={sort === key} direction={dir} onClick={() => toggleSort(key)}>{label}</TableSortLabel></TableCell>
  );
  const onFilter = (fn) => (e) => { fn(e.target.value); setPage(0); };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField size="small" label="Search name" value={q} onChange={onFilter(setQ)} />
        <TextField size="small" select label="Country" value={country} onChange={onFilter(setCountry)} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          {Object.entries(meta.countries).map(([c, v]) => <MenuItem key={c} value={c}>{v.name}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Department" value={department} onChange={onFilter(setDepartment)} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          {meta.departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </TextField>
        <Button variant="contained" onClick={() => setEditing(EMPTY)}>Add employee</Button>
      </Stack>

      <Table size="small">
        <TableHead><TableRow>
          {col('name', 'Name')}<TableCell>Title</TableCell>{col('department', 'Department')}{col('country', 'Country')}
          <TableCell align="right">Salary (local)</TableCell>{col('salaryUsd', 'Salary (USD)')}<TableCell />
        </TableRow></TableHead>
        <TableBody>
          {data.items.map((e) => (
            <TableRow key={e._id} hover>
              <TableCell>{e.name}</TableCell><TableCell>{e.jobTitle}</TableCell><TableCell>{e.department}</TableCell>
              <TableCell>{e.country}</TableCell>
              <TableCell align="right">{fmt(e.salary, e.currency)}</TableCell>
              <TableCell>{fmt(e.salaryUsd)}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => setEditing({ ...e, hireDate: e.hireDate.slice(0, 10) })}>Edit</Button>
                <Button size="small" color="error"
                  onClick={() => window.confirm(`Delete ${e.name}?`) && api.remove(e._id).then(() => { load(); onChanged(); })}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination component="div" count={data.total} page={page} rowsPerPage={limit}
        rowsPerPageOptions={[10, 25, 50, 100]} onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setLimit(+e.target.value); setPage(0); }} />

      {editing && <EmployeeDialog meta={meta} initial={editing} onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); onChanged(); }} />}
    </>
  );
}

function EmployeeDialog({ meta, initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = () => (form._id ? api.update(form._id, form) : api.create(form))
    .then(onSaved).catch((err) => setErrors(err.details?.errors || { _: 'Something went wrong' }));
  const field = (k, label, extra = {}) => (
    <TextField key={k} label={label} value={form[k] ?? ''} onChange={set(k)} error={!!errors[k]} helperText={errors[k]} size="small" {...extra} />
  );
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{form._id ? 'Edit employee' : 'Add employee'}</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ mt: 1 }}>
        {errors._ && <Alert severity="error">{errors._}</Alert>}
        {field('name', 'Name')}{field('email', 'Email')}{field('jobTitle', 'Job title')}{field('department', 'Department')}
        {field('country', 'Country', { select: true, children: Object.entries(meta.countries).map(([c, v]) => <MenuItem key={c} value={c}>{v.name} ({v.currency})</MenuItem>) })}
        {field('salary', 'Annual salary (local currency)', { type: 'number' })}
        {field('hireDate', 'Hire date', { type: 'date', InputLabelProps: { shrink: true } })}
      </Stack></DialogContent>
      <DialogActions><Button onClick={onClose}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
    </Dialog>
  );
}
