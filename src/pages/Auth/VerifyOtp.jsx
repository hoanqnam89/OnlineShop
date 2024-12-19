import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Notification from "../../components/Notification/Notification";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { login, register } from "../../actions/authAction";

const defaultTheme = createTheme();

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const { formData, generatedOtp } = location.state || {};
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const { user, loading, error } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Generated OTP:", generatedOtp);
  }, [generatedOtp]);

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Entered OTP:", otp);
    console.log("Generated OTP:", generatedOtp);

    if (otp.toString() !== generatedOtp.toString()) {
      setErrorMsg("OTP không hợp lệ. Vui lòng thử lại!");
      return;
    }
    dispatch(
      register({ userName: formData.userName, password: formData.password })
    );
  };

  useEffect(() => {
    if (error && error.status) {
      setErrorMsg(error.status);
    } else {
      setErrorMsg("");
    }
  }, [error]);

  useEffect(() => {
    // Navigate to the home page on successful registration
    if (user && user.userName) {
      setSuccessMsg("Đăng Ký Thành Công! Đang chuyển hướng đến trang chủ...");
      setShowNotification(true);
      dispatch(
        login({ userName: formData.userName, password: formData.password })
      );
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [user, navigate]);

  return (
    <ThemeProvider theme={defaultTheme}>
      {showNotification && (
        <Notification
          message={successMsg}
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
            Verify OTP
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
                  required
                  fullWidth // Đảm bảo chiếm toàn bộ chiều rộng
                  label="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  sx={{ width: "100%" }} // Tăng chiều rộng nếu cần thiết
                />
              </Grid>
              {errorMsg && (
                <Typography variant="body2" color="error">
                  {errorMsg}
                </Typography>
              )}
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default VerifyOtp;
