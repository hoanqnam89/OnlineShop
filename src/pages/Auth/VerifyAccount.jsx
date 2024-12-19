import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Notification from "../../components/Notification/Notification";

const defaultTheme = createTheme();

const VerifyAccount = () => {
  const location = useLocation();
  const { userName, otp } = location.state || {}; // Handle undefined state
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [msg, setMsg] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(120); // Countdown timer
  const [otpValid, setOtpValid] = useState(true); // To track OTP validity

  useEffect(() => {
    console.log(userName);
    console.log(otp);

    // Countdown logic
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setOtpValid(false); // Invalidate OTP
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Clean up timer on unmount
  }, [otp]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const formData = {
      userName,
      otpData: data.get("otp"),
    };

    if (!otpValid) {
      setErrorMsg("OTP đã hết hạn. Vui lòng yêu cầu mã mới!");
      return;
    }

    if (formData.otpData !== otp) {
      setErrorMsg("OTP không hợp lệ. Vui lòng thử lại!");
      return;
    }

    setLoading(true);
    try {
      setTimeout(() => {
        navigate("/forgot-password", { state: { userName } });
      }, 2000);
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      {showNotification && (
        <Notification
          message={msg}
          onClose={() => setShowNotification(false)}
        />
      )}
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Xác thực tài khoản
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  disabled
                  fullWidth
                  id="userName"
                  name="userName"
                  value={userName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="otp"
                  label="Nhập OTP"
                  type="number"
                  id="otp"
                  disabled={loading || !otpValid} // Disable if loading or OTP is invalid
                />
              </Grid>

              {errorMsg && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ marginTop: 1, marginLeft: 2 }}
                >
                  {errorMsg}
                </Typography>
              )}
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !otpValid} // Disable if loading or OTP is invalid
            >
              {loading ? "Đang xử lý..." : "Đồng ý"}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Box
                  component="span"
                  sx={{
                    pointerEvents: loading ? "none" : "auto",
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  <Link href="/signin" variant="body2">
                    Trở về đăng nhập
                  </Link>
                </Box>
              </Grid>
            </Grid>
            <Typography
              variant="body2"
              color={otpValid ? "textSecondary" : "error"}
              align="center"
              sx={{ mt: 3 }}
            >
              {otpValid ? (
                `Mã OTP sẽ hết hạn sau: ${remainingTime} giây`
              ) : (
                <>
                  Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới hoặc{" "}
                  <Link href="/signin" variant="body2">
                    quay về đăng nhập
                  </Link>
                  .
                </>
              )}
            </Typography>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default VerifyAccount;
