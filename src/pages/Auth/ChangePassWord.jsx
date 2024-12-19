import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { changePassAPI } from "../../api/userAPI";
import Notification from "../../components/Notification/Notification";
import { logout } from "../../features/authSlice";
import { useDispatch } from "react-redux";

const defaultTheme = createTheme();

const ChangePassWord = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errorMsg, setErrorMsg] = useState("");
  const [msg, setMsg] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const newPassword = data.get("newpassword");
    const confirmNewPassword = data.get("confirmNewPassword");

    if (newPassword.length < 4) {
      setErrorMsg("Mật khẩu mới phải có ít nhất 4 ký tự.");
      return;
    }

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu mới
    if (newPassword !== confirmNewPassword) {
      setErrorMsg("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setLoading(true); // Hiển thị trạng thái loading
    try {
      const token = localStorage.getItem("token"); // Lấy token từ localStorage
      if (!token) {
        setErrorMsg("Bạn cần đăng nhập trước khi thực hiện hành động này.");
        return;
      }

      const response = await changePassAPI(
        {
          userName: user.userName, // Dùng giá trị userName của người dùng đăng nhập
          passW: newPassword,
        },
        token
      );

      // Hiển thị thông báo thành công
      setMsg("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      setShowNotification(true);

      // Trì hoãn điều hướng để người dùng thấy thông báo
      setTimeout(() => {
        dispatch(logout());
        navigate("/signin");
      }, 2000);
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại."
      );
    } finally {
      setLoading(false); // Tắt trạng thái loading
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
            Đổi Mật Khẩu
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
                  value={user.userName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="newpassword"
                  label="Mật khẩu mới"
                  type="password"
                  id="newpassword"
                  disabled={loading} // Vô hiệu hóa khi loading
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmNewPassword"
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  id="confirmNewPassword"
                  disabled={loading} // Vô hiệu hóa khi loading
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
              disabled={loading} // Vô hiệu hóa khi loading
            >
              {loading ? "Đang xử lý..." : "Đồng ý"}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Box
                  component="span"
                  sx={{
                    pointerEvents: loading ? "none" : "auto", // Vô hiệu hóa khi loading
                    opacity: loading ? 0.5 : 1, // Hiệu ứng mờ
                  }}
                >
                  <Link href="/" variant="body2">
                    Trở về trang chủ
                  </Link>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default ChangePassWord;
