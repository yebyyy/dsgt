## Things to add in environment.yml
# -fastai
# timm
# wwf

import timm
import torch.nn as nn
import time

from fastai.data.core import DataLoaders
from fastai.vision.learner import has_pool_type
from fastai.vision.learner import _update_first_layer
from fastai.vision.all import *
from fastai.vision import *
from wwf.vision.timm import *
from torchvision.models import *


device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")


def train(
    train_dataset,
    valid_dataset,
    model_name,
    loss_func,
    n_epochs,
    optimizer=Adam,
    criterion=None,
    lr=1e-3,
    cut=None,
    n_out=10,
):
    """
    Args:
        dls (fastai.core.DataLoaders) : dataloader to train
        model_name (str) : name of the model
        n_epochs (int) : number of epochs to train for
        
    """

    dls = DataLoaders.from_dsets(
        train_dataset, valid_dataset, device=device
    )  ## Creates dataloaders compatible with fastai using DATASETS /TODO: Consider if using datasets is the best way??

    if is_timm(model_name):
        learner = local_timm_learner(
            dls,
            model_name,
            loss_func=loss_func,
            lr=lr,
            opt_func=optimizer,
            criterion=criterion,
            n_out=n_out,
            cut=cut,
        )
    elif is_pytorch(model_name):
        model = eval("torchvision.models.{}".format(model_name))
        learner = vision_learner(
            dls,
            model,
            loss_func=loss_func,
            lr=lr,
            opt_func=optimizer,
            n_out=n_out,
            pretrained=True,
            cut=cut,
        )
    start = time.time()
    learner.fit(n_epochs)
    end = time.time()


def get_num_features(body):
    """
    Helper method which returns the number of out_features in a model
    """

    try:
        return num_features_model(nn.Sequential(*body.children()))
    except:
        for i in range(len(body)):
            layer = body[-i + 1]
            if isinstance(layer, torch.nn.Sequential):
                for block in layer:
                    for sublayer in block.children():
                        if isinstance(
                            sublayer, timm.models.vision_transformer.Attention
                        ):
                            for ll in sublayer.children():
                                if isinstance(ll, torch.nn.modules.linear.Linear):
                                    return ll.out_features
                    break
                break


def create_timm_body(arch: str, pretrained=True, cut=None, n_in=3):
    "Creates a body from any model in the `timm` library."
    model = timm.create_model(arch, pretrained=pretrained, num_classes=10)
    _update_first_layer(model, n_in, pretrained)
    if cut is None:
        try:
            ll = list(enumerate(model.children()))
            cut = next(
                i for i, o in reversed(ll) if has_pool_type(o)
            )  ## i is the layer number and o is the type
        except StopIteration:
            cut = -1
            pass
    if isinstance(cut, int):
        return nn.Sequential(*list(model.children())[:cut])
    elif callable(cut):
        return cut(model)
    else:
        raise NameError("cut must be either integer or function")


def create_timm_model(
    arch: str,
    n_out,
    cut=None,
    pretrained=True,
    n_in=3,
    init=nn.init.kaiming_normal_,
    custom_head=None,
    concat_pool=True,
    **kwargs
):
    "Create custom architecture using `arch`, `n_in` and `n_out` from the `timm` library"
    body = create_timm_body(arch, pretrained, None, n_in)
    if custom_head is None:
        nf = get_num_features(body)
        head = create_head(nf, n_out, concat_pool=concat_pool, **kwargs)
    else:
        head = custom_head
    model = nn.Sequential(body, head)
    if init is not None:
        apply_init(model[1], init)
    return model


def local_timm_learner(
    dls,
    arch: str,
    loss_func=None,
    pretrained=True,
    cut=None,
    splitter=None,
    y_range=None,
    config=None,
    n_out=None,
    normalize=True,
    **kwargs
):
    "Build a convnet style learner from `dls` and `arch` using the `timm` library"
    if config is None:
        config = {}
    if n_out is None:
        n_out = get_c(dls)
    assert (
        n_out
    ), "`n_out` is not defined, and could not be inferred from data, set `dls.c` or pass `n_out`"
    if y_range is None and "y_range" in config:
        y_range = config.pop("y_range")
    model = create_timm_model(
        arch, n_out, default_split, pretrained, y_range=y_range, **config
    )
    learn = Learner(dls, model, loss_func=loss_func, splitter=default_split, **kwargs)
    if pretrained:
        learn.freeze()
    return learn


def is_timm(model_name):
    """
        Checks if the model_name is present in the timm models catalogue
    """
    for i in range(len(timm.list_models(pretrained=True))):
        if model_name == timm.list_models(pretrained=True)[i]:
            return True
    return False


def is_pytorch(model_name):
    """
        Checks if the model_name is in torchvision.models catalogue
    """
    for i in dir(models):
        if i == model_name:
            return True
    return False


# TODO: Can possibly add this feature?? (Talk to Karthik about this)
## The feature below allows you to use a pretrained model from any source repository

# def is_pytorch(model_name, github_repo="pytorch/vision"):
#     for i in torch.hub.list(github=github_repo):
#         if model_name == i:
#             return True
#     return False
