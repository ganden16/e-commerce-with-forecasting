import Swal from 'sweetalert2'

export const sweetAlertDelete = async (title, callback) => {
	const sweetAlert = await Swal.fire({
		title: title,
		text: "Data ini akan dihapus permanen",
		icon: "warning",
		showCancelButton: true,
		cancelButtonText: "Tidak",
		confirmButtonColor: "#3085d6",
		cancelButtonColor: "#d33",
		confirmButtonText: "Ya"
	})
	if(sweetAlert.isConfirmed) {
		callback()
	}
}
export const sweetAlertSubmitData = async (callback) => {
	const sweetAlert = await Swal.fire({
		title: "Apakah data sudah benar?",
		showCancelButton: true,
		confirmButtonText: "Simpan",
		cancelButtonText: "Batal"
	})
	if(sweetAlert.isConfirmed) {
		callback()
	}
}
export const SweetAlertSuccess = (title, textMessage) => {
	Swal.fire({
		title: title,
		text: textMessage,
		icon: "success",
	});
}
export const SweetAlertError = (textMessage) => {
	Swal.fire({
		icon: "error",
		title: "Oops...",
		text: textMessage
	});
}
export const SweetAlertConfirm = (title, textMessage, callback) => {
	Swal.fire({
		title,
		text: textMessage,
		icon: "warning",
		showCancelButton: true,
		confirmButtonColor: "#3085d6",
		cancelButtonColor: "#d33",
		confirmButtonText: "Ya",
		cancelButtonText: "Tidak"
	}).then((result) => {
		if(result.isConfirmed) {
			callback()
		}
	});
}


