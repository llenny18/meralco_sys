import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderVendorContacts from '@/leader/leader-vendor-contacts';

function LeaderVendorContactsPage() {
  return (
    <>
      <Head>
        <title>Vendor Contacts - Team Leader</title>
      </Head>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <LeaderVendorContacts />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderVendorContactsPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderVendorContactsPage;
