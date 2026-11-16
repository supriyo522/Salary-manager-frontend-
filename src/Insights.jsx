import { useEffect, useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Stack, TextField, MenuItem, Typography, Paper } from '@mui/material';
import { api, fmt } from './api.js';

export default function Insights({ meta }) {
  const [groupBy, setGroupBy] = useState('country');
  const [country, setCountry] = useState('');
  const [department, setDepartment] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const params = { groupBy };
    if (country) params.country = country;
    if (department) params.department = department;
    api.insights(params).then(setData);
  }, [groupBy, country, department]);

  const sel = (label, value, set, options) => (
    <TextField size="small" select label={label} value={value} onChange={(e) => set(e.target.value)} sx={{ minWidth: 160 }}>
      {options}
    </TextField>
  );
  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {sel('Group by', groupBy, setGroupBy, [<MenuItem key="c" value="country">Country</MenuItem>, <MenuItem key="d" value="department">Department</MenuItem>])}
        {sel('Country', country, setCountry, [<MenuItem key="" value="">All</MenuItem>, ...Object.entries(meta.countries).map(([c, v]) => <MenuItem key={c} value={c}>{v.name}</MenuItem>)])}
        {sel('Department', department, setDepartment, [<MenuItem key="" value="">All</MenuItem>, ...meta.departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)])}
      </Stack>
      {data && (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2">Overall (USD, approximate FX)</Typography>
            <Typography>{data.overall.count.toLocaleString()} employees · median {fmt(data.overall.median)} · average {fmt(data.overall.avg)} · range {fmt(data.overall.min)} to {fmt(data.overall.max)}</Typography>
          </Paper>
          <Table size="small">
            <TableHead><TableRow>
              {['Group', 'Headcount', 'Min', 'P25', 'Median', 'Average', 'P75', 'Max'].map((h) => <TableCell key={h} align={h === 'Group' ? 'left' : 'right'}>{h}</TableCell>)}
            </TableRow></TableHead>
            <TableBody>
              {data.groups.map((g) => (
                <TableRow key={g.group}>
                  <TableCell>{meta.countries[g.group]?.name || g.group}</TableCell>
                  <TableCell align="right">{g.count}</TableCell>
                  {['min', 'p25', 'median', 'avg', 'p75', 'max'].map((k) => <TableCell key={k} align="right">{fmt(g[k])}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </>
  );
}
