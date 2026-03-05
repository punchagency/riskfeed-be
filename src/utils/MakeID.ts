const MakeID = (length: number): string => {
	var result = "";
	var characters = "ABCDEFGHJKLMNPQRTUVWXY346789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

export default MakeID;
