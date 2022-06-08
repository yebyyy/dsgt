import torchvision.transforms as transforms
import pytest
from pathlib import Path
from backend.dataset import loader_from_zipped, errorMessage
from backend.constants import UNZIPPED_DIR_NAME
from filecmp import dircmp
import torch
import os

different_folder = "tests/zip_files/different_folders.Zip"
empty_folder = "tests/zip_files/empty.zip"
double_zipped = "tests/zip_files/double_zipped.zip"
not_zip = "tests/zip_files/not_zip"
num_classes = "tests/zip_files/num_classes.zip"


@pytest.mark.parametrize(
    "filepath,expected",
    [
        (not_zip, errorMessage.NOT_ZIP.value),
        (different_folder, errorMessage.TRAIN_AND_VALID_VOID.value)
    ],
)
def test_invalid_file_structure(filepath, expected):
    filepath = str(Path(filepath).parent.absolute()) + "/" + filepath.split("/")[-1]
    print(filepath)
    print(filepath)
    with pytest.raises(ValueError) as e:
        loader_from_zipped(filepath)
    assert str(e.value) == expected

@pytest.mark.parametrize(
    "filepath, relative_output_path",
    [(double_zipped, f"{UNZIPPED_DIR_NAME}/input/double_zipped")],
)
def test_load_correct_file_structure(filepath, relative_output_path):
    try:
        expected_filename = filepath.split("/")[-1]

        filepath = "tests/zip_files/{}".format(expected_filename)
        print(filepath)
        loader_from_zipped(filepath, transforms.GaussianBlur(kernel_size=3))
        print("passed the loader from zipped function without exception")
        expected_filename = expected_filename.replace(".zip", "")
        print("expected/{}".format(expected_filename))
        print(relative_output_path)
        print(os.path.exists("expected/{}".format(expected_filename)))
        print(os.path.exists("tests/expected/{}".format(expected_filename)))
        print(os.path.exists(relative_output_path))
        dcmp = dircmp(relative_output_path, "tests/expected/{}".format(expected_filename))

        assert len(dcmp.diff_files) == 0
    except Exception:
        assert False


@pytest.mark.parametrize(
    "train_transform, valid_transform, filepath",
    [
        (None, transforms.GaussianBlur(kernel_size=3), "double_zipped.zip"),
        (
            transforms.Compose(
                [
                    transforms.GaussianBlur(kernel_size=3),
                    transforms.RandomHorizontalFlip(p=0.4),
                ]
            ),
            None,
            "double_zipped.zip",
        ),
        (
            transforms.RandomHorizontalFlip(p=0.9),
            transforms.Compose(
                [
                    transforms.RandomVerticalFlip(p=0.3),
                    transforms.GaussianBlur(kernel_size=3),
                ]
            ),
            "double_zipped.zip",
        ),
    ],
)
def check_diff_transforms(train_transform, valid_transform, filepath):
    train_loader, valid_loader = loader_from_zipped(
        filepath, valid_transform=valid_transform, train_transform=train_transform
    )

    for data, index in train_loader:
        if index == 0:
            train_data_val = data
            break

    for data, index in valid_loader:
        if index == 0:
            valid_data_val = data
            break

    assert not torch.equal(train_data_val, valid_data_val)