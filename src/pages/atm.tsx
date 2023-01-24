import {
    DAILY_DEBIT_AMOUNT_LIMIT,
    useCustomerData,
} from '../components/CustomerProvider';
import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

interface DepositFormInput {
    depositAmount: number;
}

interface DebitFormInput {
    debitAmount: number;
}

const Atm = () => {
    const {
        firstName,
        lastName,
        getBalance,
        addDeposit,
        addDebit,
        isUnderWithdrawalAmountLimit,
    } = useCustomerData();

    const {
        handleSubmit: handleDepositSubmit,
        formState: { errors: depositErrors },
        control: depositControl,
    } = useForm<DepositFormInput>({ mode: 'all' });
    const {
        handleSubmit: handleDebitSubmit,
        control: debitControl,
        formState: { errors: debitErrors },
        setError: setDebitError,
    } = useForm<DebitFormInput>({ mode: 'all' });

    const onDepositSubmit: SubmitHandler<DepositFormInput> = (data) => {
        addDeposit(data.depositAmount);
    };

    const onDebitSubmit: SubmitHandler<DebitFormInput> = (data) => {
        try {
            addDebit(Number(data.debitAmount));
        } catch (err: any) {
            setDebitError('debitAmount', err);
        }
    };

    return (
        <Box maxWidth="md" sx={{ margin: 'auto' }}>
            <Paper sx={{ padding: '2em' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ textAlign: 'center' }}>
                        <Typography variant="h2">ATM</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Grid container sx={{ textAlign: 'center' }}>
                            <Grid item xs={12}>
                                <Typography variant="h3" component="div">
                                    Hello, {firstName} {lastName}!
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h4" component="div">
                                    Your Balance: ${getBalance()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={6}>
                        <Grid container>
                            <Grid item xs={12} sx={{ marginBottom: '3em' }}>
                                <form
                                    onSubmit={handleDepositSubmit(
                                        onDepositSubmit
                                    )}
                                >
                                    <Grid container>
                                        <Grid
                                            item
                                            xs={12}
                                            sx={{ marginBottom: '.5em' }}
                                        >
                                            <Controller
                                                name={'depositAmount'}
                                                control={depositControl}
                                                render={({ field }) => (
                                                    <TextField
                                                        label="Amount to Deposit"
                                                        type="number"
                                                        fullWidth
                                                        error={
                                                            !!depositErrors.depositAmount
                                                        }
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <Button
                                                                    type="submit"
                                                                    variant="contained"
                                                                >
                                                                    Deposit
                                                                </Button>
                                                            ),
                                                        }}
                                                        {...field}
                                                    />
                                                )}
                                                rules={{
                                                    required:
                                                        'This is a required field',
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </form>
                            </Grid>
                            <Grid item xs={12}>
                                <form
                                    onSubmit={handleDebitSubmit(onDebitSubmit)}
                                >
                                    <Grid container>
                                        <Grid
                                            item
                                            xs={12}
                                            sx={{ marginBottom: '.5em' }}
                                        >
                                            <Controller
                                                name={'debitAmount'}
                                                control={debitControl}
                                                render={({ field }) => (
                                                    <TextField
                                                        label="Amount to Withdraw"
                                                        type="number"
                                                        fullWidth
                                                        error={
                                                            !!debitErrors.debitAmount
                                                        }
                                                        InputProps={{
                                                            endAdornment: (
                                                                <Button
                                                                    type="submit"
                                                                    variant="contained"
                                                                >
                                                                    Withdraw
                                                                </Button>
                                                            ),
                                                        }}
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        {...field}
                                                    />
                                                )}
                                                rules={{
                                                    required:
                                                        'This is a required field',
                                                    validate: (value) =>
                                                        isUnderWithdrawalAmountLimit(
                                                            Number(value)
                                                        ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2">
                                                There is a daily withdrawl limit
                                                of ${DAILY_DEBIT_AMOUNT_LIMIT}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            {debitErrors.debitAmount &&
                                                debitErrors.debitAmount.type ===
                                                    'validate' && (
                                                    <Typography
                                                        color="error"
                                                        variant="body1"
                                                    >
                                                        Will exceed daily limit.
                                                    </Typography>
                                                )}
                                        </Grid>
                                    </Grid>
                                </form>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default Atm;
